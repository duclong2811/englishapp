export type VoiceLocale="en-US"|"en-GB"|"ko-KR";
export type BrowserVoice={name:string;lang:string;localService:boolean;voiceURI:string};
export function classifyVoice(lang:string):VoiceLocale|null{const value=lang.replace("_","-").toLowerCase();if(value==="en-us"||value.startsWith("en-us-"))return"en-US";if(value==="en-gb"||value.startsWith("en-gb-"))return"en-GB";if(value==="ko-kr"||value.startsWith("ko-kr-"))return"ko-KR";return null}
export function discoverVoices(synth:Pick<SpeechSynthesis,"getVoices">|undefined):Record<VoiceLocale,BrowserVoice[]>{const groups:Record<VoiceLocale,BrowserVoice[]>={"en-US":[],"en-GB":[],"ko-KR":[]};if(!synth)return groups;for(const voice of synth.getVoices()){const locale=classifyVoice(voice.lang);if(locale)groups[locale].push({name:voice.name,lang:voice.lang,localService:voice.localService,voiceURI:voice.voiceURI})}return groups}
export function selectVoice(voices:SpeechSynthesisVoice[],locale:VoiceLocale,preferredUri?:string){return voices.find(v=>v.voiceURI===preferredUri&&classifyVoice(v.lang)===locale)??voices.find(v=>classifyVoice(v.lang)===locale)??null}
export type SpeechStatus="idle"|"speaking"|"paused"|"unavailable"|"error";
export class BrowserSpeechProvider{
  readonly enabled:boolean;private synth?:SpeechSynthesis;
  constructor(synth=typeof window!=="undefined"?window.speechSynthesis:undefined){this.synth=synth;this.enabled=Boolean(synth)}
  voices(){return discoverVoices(this.synth)}
  speak(text:string,{locale="en-US",rate=1,voiceURI}:{locale?:VoiceLocale;rate?:number;voiceURI?:string}={}){if(!this.synth||typeof SpeechSynthesisUtterance==="undefined")return{ok:false as const,error:"unsupported" as const};const voice=selectVoice(this.synth.getVoices(),locale,voiceURI);if(!voice)return{ok:false as const,error:"voice-unavailable" as const};this.synth.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang=locale;utterance.voice=voice;utterance.rate=Math.max(.5,Math.min(1.25,rate));this.synth.speak(utterance);return{ok:true as const,source:"synthesized" as const,voice:voice.name}}
  pause(){this.synth?.pause()}resume(){this.synth?.resume()}stop(){this.synth?.cancel()}
}
