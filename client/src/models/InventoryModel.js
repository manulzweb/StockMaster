import { createProduct, updateProduct, deleteProduct } from "../services/product.service"

export class InventoryModel {
    constructor() {
        this.products = new Map()
        this.currentPage = 1
        this.itemsPerPage = 5
        this.totalPages = 0
    }

    setProducts(productsArray) {
        this.products.clear()
        productsArray.forEach((product) => {
            this.products.set(String(product.id), product)
        })
        this.totalPages = this.products.size
    }

    getAllProducts() {
        return Array.from(this.products.values())
    }

    getPaginatedProducts() {
        const all = this.getAllProducts()
        const startIndex = (this.currentPage - 1) * this.itemsPerPage
        const endIndex = startIndex + this.itemsPerPage
        return all.slice(startIndex, endIndex)
    }

    nextPage() {
        const _totalPagesCount = Math.ceil(this.products.size / this.itemsPerPage)
        if (this.currentPage < _totalPagesCount) {
            this.currentPage++
            return true
        }
        return false
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--
            return true
        }
        return false
    }

    getTotalItems() {
        return this.products.size
    }

    getProduct(id) {
        return this.products.get(String(id))
    }

    async addProduct(productData) {
        const createdProduct = await createProduct(productData)
        this.products.set(String(createdProduct.id), createdProduct)
        this.totalPages = this.products.size
        this.currentPage = Math.ceil(this.products.size / this.itemsPerPage) || 1
        return createdProduct
    }

    async updateExistingProduct(id, productData) {
        const idStr = String(id)
        productData.id = id
        await updateProduct(idStr, productData)
        this.products.set(idStr, productData)
        return productData
    }

    async removeProduct(id) {
        await deleteProduct(id)
        this.products.delete(String(id))
        this.totalPages = this.products.size
        const _totalPagesCount = Math.ceil(this.products.size / this.itemsPerPage)

        if (this.currentPage > _totalPagesCount && _totalPagesCount > 0) {
            this.currentPage = _totalPagesCount
        }
    }

    getStats() {
        let totalValue = 0
        let criticalStock = 0

        this.products.forEach((value) => {
            totalValue += value.stock * value.precio
            if (value.stock <= 5) criticalStock++
        })

        return {
            totalSKU: this.products.size,
            totalValue,
            criticalStock
        }
    }

    searchProduct(query) {
        return query
    }
}
