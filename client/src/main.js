import { getProducts } from './services/product.service';
import { showToast } from './shared/components/Toast';
import { InventoryModel } from './models/InventoryModel';
import { InventoryController } from "./controllers/InventoryController";
import './styles/globals.css';

const init = async () => {
    try {
        const data = await getProducts()
        const model = new InventoryModel()
        model.setProducts(data)
        const inventoryController = new InventoryController('#inventory-list', '#product-form', model)
        inventoryController.render()
    } catch (e) {
        showToast('No hay productos', 'error');
        console.log(e);

    }
}

init()