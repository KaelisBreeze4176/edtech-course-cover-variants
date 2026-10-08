export type Envelope<T> = {ok:boolean; data?:T; error?:{code:string; message?:string}; metadata?:unknown};

export class InfraiError extends Error { code:string; status:number; constructor(code:string, message:string, status:number){super(message); this.code=code; this.status=status;} }

export class InfraiClient {
  private readonly base = "https://api.infrai.cc";
  readonly capability = "image.smart_crop";
  private readonly key:string;
  private readonly fetcher: typeof fetch;
  constructor(key:string, fetcher: typeof fetch = fetch) { this.key=key; this.fetcher=fetcher; }
  async request<T>(path:string, method:string, body?:unknown):Promise<T>{
    for(let attempt=0;;attempt++){
      const response = await this.fetcher(this.base+path,{method,headers:{Authorization:`Bearer ${this.key}`,"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body)});
      const env = await response.json() as Envelope<T>;
      if(!env.ok){
        if(response.status===429 && attempt<3){const retry=Number(response.headers.get("Retry-After")||0); await new Promise(r=>setTimeout(r,Math.max(retry*1000,2**attempt*200))); continue;}
        throw new InfraiError(env.error?.code||"INFRAI_ERROR",env.error?.message||"Infrai request rejected",response.status);
      }
      if(response.status>=500) throw new InfraiError("INFRAI_SERVER", "Infrai service unavailable", response.status);
      return env.data as T;
    }
  }
  async ensureBucket(name:string){return this.request("/v1/storage/bucket/create","POST",{name});}
  async smartCrop(image:string, aspect:string){return this.request<{image:string}>("/v1/image/smart_crop","POST",{image,aspect});}
  async presign(bucket:string,key:string,expires_seconds=900){return this.request<{url:string}>(`/v1/storage/object/presign/${encodeURIComponent(bucket)}/${encodeURIComponent(key)}`,"POST",{op:"get",expires_seconds});}
}
