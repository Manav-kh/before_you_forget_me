import { handleApi } from '@byfm/domain';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const GET=(request:Request)=>handleApi(request);
export const POST=(request:Request)=>handleApi(request);
export const PATCH=(request:Request)=>handleApi(request);
export const DELETE=(request:Request)=>handleApi(request);
export const OPTIONS=(request:Request)=>handleApi(request);
