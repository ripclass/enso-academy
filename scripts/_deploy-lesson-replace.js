// Structural single-lesson deploy: REPLACE a lesson's content_library_elements
// rows from its artifact (delete + fresh insert, new scene IDs). Use when the
// scene structure changed (count/order/types), where _deploy-lesson.js's
// in-place-by-title update cannot apply. Safe only while the course has no
// real student progress worth preserving on this lesson.
// Usage: node scripts/_deploy-lesson-replace.js <course> <lessonSlug>
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const COURSE = process.argv[2];
const SLUG = process.argv[3];
if (!COURSE || !SLUG) { console.error('usage: node scripts/_deploy-lesson-replace.js <course> <lessonSlug>'); process.exit(1); }

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/\s/)[0], { auth: { persistSession: false } });

// Mirrors lib/ai/generator/writer.ts elementType/sceneBody exactly.
function elementType(scene) {
  if (scene.sceneType === 'quiz') return 'quiz_question';
  if (scene.sceneType === 'slide' && scene.sceneData?.template === 'definition') return 'definition';
  return 'explanation';
}
function sceneBody(scene) {
  const d = scene.sceneData || {};
  let body = '';
  if (scene.sceneType === 'reading') body = d.body ?? '';
  else if (scene.sceneType === 'slide') body = d.narration ?? '';
  else if (scene.sceneType === 'quiz') body = d.intro ?? '';
  else body = d.summary ?? '';
  return body && String(body).trim() ? String(body) : scene.title || 'Untitled scene';
}

(async () => {
  const art = JSON.parse(fs.readFileSync(`generated/${COURSE}/lessons/${SLUG}.json`, 'utf8'));

  const { data: lessons, error: el } = await sb
    .from('lessons')
    .select('id, module_id, modules!inner(course_id, courses!inner(slug))')
    .eq('slug', SLUG)
    .eq('modules.courses.slug', COURSE);
  if (el) throw el;
  if (!lessons || lessons.length !== 1) throw new Error('lesson lookup returned ' + (lessons ? lessons.length : 0));
  const lesson = lessons[0];
  const courseId = lesson.modules.course_id;

  const { count: before } = await sb
    .from('content_library_elements')
    .select('id', { count: 'exact', head: true })
    .eq('lesson_id', lesson.id);

  const { error: ed } = await sb.from('content_library_elements').delete().eq('lesson_id', lesson.id);
  if (ed) throw ed;

  const rows = art.scenes.map((scene, si) => ({
    course_id: courseId,
    module_id: lesson.module_id,
    lesson_id: lesson.id,
    element_type: elementType(scene),
    scene_type: scene.sceneType,
    scene_data: scene.sceneData,
    title: scene.title,
    body: sceneBody(scene),
    concept_tags: scene.conceptTags ?? [],
    teaches_concepts: scene.teachesConcepts ?? [],
    metadata: { order: si + 1 },
  }));
  const { error: ei } = await sb.from('content_library_elements').insert(rows);
  if (ei) throw ei;

  console.log(`replaced ${before} rows with ${rows.length} for ${COURSE}/${SLUG}`);
})().catch((e) => { console.error(e); process.exit(1); });
