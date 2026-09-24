import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssistProvider } from "./AssistProvider";
import { KoreanAssist } from "./KoreanAssist";

function mockMode(mode:"off"|"on-demand"|"always"){vi.stubGlobal("fetch",vi.fn().mockResolvedValue({json:async()=>({preferences:{assistMode:mode}})}))}
const renderAssist=()=>render(<AssistProvider><KoreanAssist term="review"/></AssistProvider>);

describe("Vietnamese Assist Layer",()=>{
  beforeEach(()=>{localStorage.clear();vi.restoreAllMocks()});
  it("keeps Korean primary and hides Vietnamese when off",async()=>{mockMode("off");renderAssist();expect(screen.getByText("복습")).toBeVisible();await waitFor(()=>expect(screen.queryByText("Ôn tập")).not.toBeInTheDocument())});
  it("shows quiet secondary Vietnamese in always mode without duplicate screen-reader output",async()=>{mockMode("always");renderAssist();const viText=await screen.findByText("Ôn tập");expect(screen.getByText("복습")).toBeVisible();expect(viText).toHaveAttribute("aria-hidden","true")});
  it("opens on hover and keyboard focus in on-demand mode",async()=>{mockMode("on-demand");renderAssist();const korean=screen.getByText("복습");const label="Xem giải thích tiếng Việt cho “복습”";await waitFor(()=>expect(screen.getByLabelText(label)).toBeVisible());fireEvent.mouseEnter(korean.parentElement!);expect(screen.getByRole("tooltip")).toHaveTextContent("Ôn tập");fireEvent.mouseLeave(korean.parentElement!);fireEvent.focus(screen.getByLabelText(label));expect(screen.getByRole("tooltip")).toBeVisible()});
  it("supports explicit touch-style activation and Escape dismissal",async()=>{mockMode("on-demand");renderAssist();const trigger=await screen.findByLabelText("Xem giải thích tiếng Việt cho “복습”");fireEvent.click(trigger);expect(screen.getByRole("tooltip")).toBeVisible();fireEvent.keyDown(document,{key:"Escape"});expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()});
  it("does not submit a form when help is opened",async()=>{mockMode("on-demand");const submit=vi.fn((event:React.FormEvent)=>event.preventDefault());render(<AssistProvider><form onSubmit={submit}><KoreanAssist term="saveSettings"/></form></AssistProvider>);fireEvent.click(await screen.findByLabelText("Xem giải thích tiếng Việt cho “설정 저장”"));expect(submit).not.toHaveBeenCalled()});
  it("falls back to Korean when a custom translation is missing",async()=>{mockMode("on-demand");render(<AssistProvider><KoreanAssist korean="사용자 문구"/></AssistProvider>);expect(screen.getByText("사용자 문구")).toBeVisible();expect(screen.queryByRole("button")).not.toBeInTheDocument()});
});
