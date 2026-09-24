"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AssistMode, UiTermKey } from "@/lib/assist/registry";
/* eslint-disable react-hooks/set-state-in-effect */

type Usage={key:UiTermKey;count:number;lastRequested:string};
type AssistContextValue={mode:AssistMode;setMode:(mode:AssistMode)=>void;record:(key:UiTermKey)=>void;usage:Usage[]};
const AssistContext=createContext<AssistContextValue>({mode:"on-demand",setMode:()=>{},record:()=>{},usage:[]});
const usageKey="vietnamese-assist-usage";

export function AssistProvider({children}:{children:React.ReactNode}){const[mode,setModeState]=useState<AssistMode>("on-demand");const[usage,setUsage]=useState<Usage[]>([]);useEffect(()=>{fetch("/api/state").then(r=>r.json()).then(data=>{if(data.preferences?.assistMode)setModeState(data.preferences.assistMode)}).catch(()=>{});try{setUsage(JSON.parse(localStorage.getItem(usageKey)??"[]"))}catch{}},[]);const setMode=useCallback((next:AssistMode)=>{setModeState(next)},[]);const record=useCallback((key:UiTermKey)=>{setUsage(current=>{const found=current.find(item=>item.key===key);const next=found?current.map(item=>item.key===key?{...item,count:item.count+1,lastRequested:new Date().toISOString()}:item):[...current,{key,count:1,lastRequested:new Date().toISOString()}];localStorage.setItem(usageKey,JSON.stringify(next));return next})},[]);const value=useMemo(()=>({mode,setMode,record,usage}),[mode,setMode,record,usage]);return <AssistContext.Provider value={value}>{children}</AssistContext.Provider>}
export const useAssist=()=>useContext(AssistContext);
