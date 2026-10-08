import {InfraiClient} from "./infrai_client.ts";
import {publishCourseCover} from "./edtech_service.ts";

const key=process.env.INFRAI_API_KEY;
if(!key) throw new Error("Set INFRAI_API_KEY before running the example");
const result=await publishCourseCover({courseId:"storefront-101",image:"https://example.com/course-cover.jpg",dueAt:"2030-06-01T09:00:00Z"},new InfraiClient(key));
console.log(JSON.stringify(result,null,2));
