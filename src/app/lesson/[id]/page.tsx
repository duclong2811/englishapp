import { notFound } from "next/navigation";
import { a1BilingualLessons } from "@/content/a1-bilingual";
import { A1BilingualLessonPlayer } from "@/components/A1BilingualLessonPlayer";
export default async function LessonPage({params}:{params:Promise<{id:string}>}){const{id}=await params;const lesson=a1BilingualLessons.find(item=>item.id===id);if(!lesson)notFound();return <A1BilingualLessonPlayer lesson={lesson}/>}
