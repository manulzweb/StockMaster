import { getProducts } from './services/product.service';
import { renderRows } from './shared/components/Tablerow';
import { showToast } from './shared/components/Toast';
import './styles/globals.css';

const init = async () => {
    try {
        const data = await getProducts();
        renderRows(data);
    } catch (e) {
        showToast('No hay productos','error')
        console.log(e);
        
    }
}

init()