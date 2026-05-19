import { createProduct, updateProduct, deleteProduct } from "../services/product.service"
import { tableRow, formatStockText, getColorByStock, formatPriceText } from "../shared/components/tableRow"
import { showToast, showConfirm } from "../shared/components/Toast"
import { statCard } from "../shared/components/statsCard"
import { pagination } from "../shared/components/paginationFooter"


export class InventoryController {
    constructor(containerSelector, formSelector) {
        this.tableBody = document.querySelector(containerSelector)
        this.form = document.querySelector(formSelector)
        this.products = new Map()
        this.currentPage = 1
        this.itemsPerPage = 3
        this.totalPages = 0
        this.paginationContainer = document.querySelector('#pagination')
        this._initFormListener()
        this._initSearchBarListener()
    }

    render(products) {
        if (!products) {
            throw new Error('No hay productos en el inventario')
        }
        products.forEach((product) => {
            this.products.set(String(product.id), product)
        })
        this._renderTable(products)
        this._renderStats()
    }

    _renderTable(products) {
        let tableRows = ''
        const startIndex = (this.currentPage - 1) * this.itemsPerPage
        const endIndex = startIndex + this.itemsPerPage
        const itemsToShow = products.slice(startIndex, endIndex)
        this.totalPages = products.length

        itemsToShow.forEach(product => {

            tableRows += tableRow(product)

        })
        this.tableBody.innerHTML = tableRows
        this._attachEventListeners()
        this._renderPaginationUI()
    }

    _renderPaginationUI() {
        const totalItems = this.totalPages
        const start = totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1
        const end = Math.min(this.currentPage * this.itemsPerPage, totalItems)
        const hasPrev = this.currentPage > 1
        const hasNext = this.currentPage < Math.trunc(totalItems / this.itemsPerPage)+1

        if (this.paginationContainer) {
            this.paginationContainer.innerHTML = pagination({ start, end, total: totalItems, hasPrev, hasNext })
            this._attachPaginationListeners()
        }
    }

    _attachPaginationListeners() {
        const btnPrev = this.paginationContainer.querySelector('#btn-prev')
        const btnNext = this.paginationContainer.querySelector('#btn-next')

        if (btnPrev && !btnPrev.disabled) {
            btnPrev.addEventListener('click', () => {
                this.currentPage--
                this._renderTable(Array.from(this.products.values()))
            })
        }

        if (btnNext && !btnNext.disabled) {
            btnNext.addEventListener('click', () => {
                this.currentPage++
                this._renderTable(Array.from(this.products.values()))
            })
        }
    }

    _attachEventListeners() {
        const editButtons = this.tableBody.querySelectorAll('.edit-btn')
        const deleteButtons = this.tableBody.querySelectorAll('.delete-btn')

        editButtons.forEach((editBtn) => {
            editBtn.addEventListener('click', (event) => {
                const idProduct = event.currentTarget.dataset.id
                const product = this.products.get(String(idProduct))
                this._handleEdit(product)
            })
        })

        deleteButtons.forEach((delBtn) => {
            delBtn.addEventListener('click', (event) => {
                const idProduct = event.currentTarget.dataset.id
                const product = this.products.get(String(idProduct))
                if (product) this._handleDelete(product)
            })
        })
    }

    _handleEdit(product) {
        this.form.querySelector('#nombre').value = product.nombre || ''
        this.form.querySelector('#precio').value = product.precio || ''
        this.form.querySelector('#stock').value = product.stock || 0
        this.form.querySelector('#descripcion').value = product.descripcion || ''

        document.querySelector('#form-title').textContent = 'Editando producto'
        const submitBtn = this.form.querySelector('#btn-submit')
        submitBtn.textContent = 'Actualizar'

        this.form.dataset.mode = 'edit'
        this.form.dataset.editId = product.id
    }

    _initSearchBarListener() {
        const bar = document.querySelector('.search-bar')
        bar.addEventListener('keydown', (event)=>{
            if (event.key != 'Esc') {
                bar.textContent = ''
            } else {
                this._searchProduct()
            }
        })
    }

    _searchProduct(){
        return 'hola'
    }
    _initFormListener() {
        const submitBtn = this.form.querySelector('#btn-submit')
        const cancelBtn = this.form.querySelector('#btn-cancel')
        cancelBtn.addEventListener('click', (event) => {
            event.preventDefault()
            this.form.reset()
        })

        submitBtn.addEventListener('click', async (event) => {
            event.preventDefault()

            const mode = this.form.dataset.mode || 'create'

            try {
                if (mode === 'edit') {
                    const id = this.form.dataset.editId
                    await this._handleUpdate(id)
                    showToast('Notificación', 'Producto actualizado correctamente')
                    this.form.reset()
                    this.form.dataset.mode = 'create'
                    this.form.removeAttribute('data-edit-id')
                    document.querySelector('#form-title').textContent = 'Agregar producto'
                    submitBtn.textContent = 'Guardar'
                } else {
                    await this._handleCreate()
                    showToast('Notificación', 'Producto registrado correctamente')
                    this.form.reset()
                }
            } catch (error) {
                console.error("Operación cancelada o fallida:", error)
            }
        })

    }

    _validateInputs() {
        const newName = this.form.querySelector('#nombre').value.trim()
        const newPrice = Number(this.form.querySelector('#precio').value)
        const stockInput = this.form.querySelector('#stock').value
        const newStock = Number(stockInput)
        let newDescription = this.form.querySelector('#descripcion').value.trim()

        if (!newName) {
            showToast('Advertencia', 'El nombre es obligatorio', 'warning')
            throw new Error('Nombre invalido')
        }
        
        if (!newPrice || newPrice <= 0) {
            showToast('Advertencia', 'El precio debe ser mayor a 0', 'warning')
            throw new Error('Precio invalido')
        }

        if (stockInput === '' || newStock < 0) {
            showToast('Advertencia', 'El stock no puede estar vacío ni ser negativo', 'warning')
            throw new Error('Stock invalido')
        }

        newDescription = newDescription || 'Sin descripción'

        return {
            nombre: newName,
            precio: newPrice,
            stock: newStock,
            descripcion: newDescription
        }
    }

    async _handleCreate() {
        const newData = this._validateInputs()
        const createdProduct = await createProduct(newData)
        this.products.set(String(createdProduct.id), createdProduct)
        const allProductsArray = Array.from(this.products.values())
        this.currentPage = Math.trunc(allProductsArray.length / this.itemsPerPage) + 1
        this._renderTable(allProductsArray)
        this._renderStats()
    }

    async _handleUpdate(id) {
        const idStr = String(id)
        const newData = this._validateInputs()
        newData.id = id

        await updateProduct(idStr, newData)

        this.products.set(idStr, newData)
        this._updateRowDOM(newData)
        this._renderStats()
    }

    async _handleDelete(product) {
        const isConfirmed = await showConfirm(
            'Confirmar eliminación',
            `¿Desea usted eliminar el siguiente producto? \nNombre: ${product.nombre} | Precio: ${product.precio} | Stock: ${product.stock}`,
            null,
            { title: 'Cancelado', text: 'El producto sigue en el inventario' }
        )

        if (isConfirmed) {
            this.products.delete(String(product.id))

            const allProductsArray = Array.from(this.products.values())
            const totalPagesCalculated = Math.ceil(allProductsArray.length / this.itemsPerPage)
            
            if (this.currentPage > totalPagesCalculated && totalPagesCalculated > 0) {
                this.currentPage = totalPagesCalculated
            }

            this._renderTable(allProductsArray)

            await deleteProduct(product.id)
            showToast('Notificación', 'Producto eliminado correctamente', 'success')
            this._renderStats()
        }
    }

    _updateRowDOM(product) {
        const row = this.tableBody.querySelector(`tr[data-id="${product.id}"]`)
        if (!row) return

        const nameProduct = row.querySelector('.product-name')
        if (nameProduct.textContent !== product.nombre) nameProduct.textContent = product.nombre

        const descriptionProduct = row.querySelector('.product-description')
        if (descriptionProduct.textContent !== product.descripcion) descriptionProduct.textContent = product.descripcion

        const priceProduct = row.querySelector('.product-price')
        const newPrice = `$${formatPriceText(product.precio)}`
        if (priceProduct.textContent !== newPrice) priceProduct.textContent = newPrice

        const stockBadge = row.querySelector('.product-stock')
        const newStockText = formatStockText(product.stock)
        if (stockBadge.textContent !== newStockText) stockBadge.textContent = newStockText

        const newClassName = `product-stock px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight border ${getColorByStock(product.stock)}`
        if (stockBadge.className !== newClassName) stockBadge.className = newClassName
    }

    _renderStats() {
        let totalSKU = this.products.size
        let totalValue = 0
        let criticalStock = 0

        this.products.forEach((value) => {
            totalValue += value.stock * value.precio
            if (value.stock <= 5) criticalStock++
        })

        const statsContainer = document.querySelector('#stats')
        if (!statsContainer) return

        statsContainer.innerHTML = `
            ${statCard({
            title: 'Total SKU',
            value: totalSKU
        })}
            ${statCard({
            title: 'Valor Inventario',
            value: '$' + formatPriceText(totalValue),
            borderStyle: 'border-l-4 border-l-indigo-500'
        })}
            ${statCard({
            title: 'Stock Crítico',
            value: criticalStock,
            borderStyle: 'border-l-4 border-l-rose-500',
            valueColor: 'text-rose-500'
        })}
        `
    }
}
