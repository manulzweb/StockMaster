import { getProducts } from './services/product.service';
import { showToast } from './shared/components/Toast';
import { InventoryModel } from './models/InventoryModel';
import { InventoryController } from "./controllers/InventoryController";
import { ThemeController } from "./controllers/ThemeController";
import { initI18n } from "./shared/i18n";
import './styles/globals.css';

const init = async () => {
    try {
        const themeController = new ThemeController();
        const themeSelect = document.querySelector('#theme-selector');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                themeController.setTheme(e.target.value);
            });
        }

        await initI18n();

        const data = await getProducts()
        const inventoryController = new InventoryController('#inventory-list', '#product-form')
        inventoryController.render(data)

        window.addEventListener('languageChanged', () => {
            inventoryController._renderTable(inventoryController._getCurrentProducts());
            inventoryController._renderStats();
        });
    } catch (e) {
        showToast('toast.warning', 'toast.error_name', 'error');
        console.log(e);
    }
}

init()