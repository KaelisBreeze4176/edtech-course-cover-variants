import {z} from "zod";
import {InfraiClient} from "./infrai_client.ts";

export const courseCoverRequest = z.object({courseId:z.string().min(1), image:z.string().min(1), dueAt:z.coerce.date()});
export type CourseCoverRequest = z.infer<typeof courseCoverRequest>;
export const coverAspects = ["1:1","4:3","16:9"] as const;

export function deadlineState(dueAt:Date, now:Date):"open"|"due"|"late" { return now<dueAt?"open":now.getTime()===dueAt.getTime()?"due":"late"; }

export async function publishCourseCover(input:unknown, client:InfraiClient){
  const request=courseCoverRequest.parse(input);
  const variants:Record<string,string>={};
  for(const aspect of coverAspects){const result=await client.smartCrop(request.image,aspect); variants[aspect]=result.image;}
  const signed=await client.presign("course-covers",`${request.courseId}/16-9`);
  return {courseId:request.courseId,deadline:deadlineState(request.dueAt,new Date()),variants,deliveryUrl:signed.url};
}
