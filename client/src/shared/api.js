import { showToast} from "./components/Toast";

const url = 'http://localhost:3000/';

export const request = async (endpoint, method) => {
    try {
        const response =  await fetch(url+endpoint, {
            method: method
        })
        const data = await response.json()
        return data;
    } catch (error) {
      showToast("Error", `Falló: ${error.message}`, 'error')
    }
}