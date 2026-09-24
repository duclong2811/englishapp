import{a2Unit1}from"./a2-unit-1";import{a2Unit2,a2Unit3}from"./a2-units-2-3";import{a2Unit4}from"./a2-unit-4";import{a2Unit5}from"./a2-unit-5";import{a2Unit6}from"./a2-unit-6";export const a2Units=[a2Unit1,a2Unit2,a2Unit3,a2Unit4,a2Unit5,a2Unit6];export const a2Lessons=a2Units.flatMap(unit=>unit.lessons);

/** A2 Unit 1–6 là nội dung đã hoàn chỉnh; Unit 7–8 mới chỉ có trong curriculum map. */
export function findA2Unit(unitId:string){return a2Units.find(unit=>unit.id===unitId)}
