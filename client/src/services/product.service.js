import { request } from "../shared/api";

export const getProducts = async () => {
    return await request('productos', 'GET');
}