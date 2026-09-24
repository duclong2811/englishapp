export type VideoLevel="A1"|"A2"|"B1"|"B2";
export type VideoAccent="US"|"UK"|"mixed"|"other";
export type VideoMetadata={id:string;provider:"voa-learning-english";sourceTitle:string;sourceUrl:string;embedUrl?:string;level:VideoLevel;accent:VideoAccent;durationSeconds?:number;transcriptAvailable:boolean;license:string;attribution:string;commercialUseStatus:"allowed"|"restricted"|"unknown";thirdPartyContentWarning:string;lastVerifiedDate:string};
export interface VideoSourceProvider{readonly id:"voa-learning-english";enabled:boolean;search(query:string,level:VideoLevel):Promise<VideoMetadata[]>;get(id:string):Promise<VideoMetadata|null>}
export const disabledVoaProvider:VideoSourceProvider={id:"voa-learning-english",enabled:false,async search(){return[]},async get(){return null}};
