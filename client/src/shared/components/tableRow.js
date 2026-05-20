import i18next from 'i18next';

export const getColorByStock = (stock) => {
    const STOCK_COLOR = [
        { limit: 5, styles: 'bg-(--danger-bg) text-(--danger-text) border-(--danger-border)' },
        { limit: 10, styles: 'bg-(--warning-bg) text-(--warning-text) border-(--warning-border)' }
    ]

    let firstValid = STOCK_COLOR.find(item => stock < item.limit)
    return firstValid?.styles || 'bg-(--success-bg) text-(--success-text) border-(--success-border)'
}

export const formatStockText = (stock) => {
    if (stock > 1) return `${stock} ${i18next.t('components.units')}`
    if (stock === 1) return `${stock} ${i18next.t('components.unit')}`
    return i18next.t('components.out_of_stock')
}

export const formatPriceText = (price) => {
    return price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
}

export const tableRow = (product) => {
    let stockColor = getColorByStock(product.stock)
    let stockFormated = formatStockText(product.stock)
    let priceFormated = formatPriceText(product.precio)

    return `
        <tr class="hover:bg-(--bg-hover) transition-colors duration-300 group" data-id="${product.id}">
            <td class="px-8 py-6">
                <div class="flex flex-col">
                <span class="product-name font-bold text-(--text-primary)">${product.nombre}</span>
                <span class="product-description text-xs text-(--text-muted) mt-1 line-clamp-1 max-w-75">${product.descripcion}</span>
                </div>
            </td>
            <td class="px-8 py-6 text-center">
                <span class="product-stock px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight border transition-colors duration-300 ${stockColor}">${stockFormated}</span>
            </td>
            <td class="product-price px-8 py-6 text-center font-bold text-(--text-primary)">$${priceFormated}</td>
            <td class="px-8 py-6 text-right">
                <div class="flex justify-end gap-3">
                <button data-id="${product.id}" class="edit-btn w-10 h-10 flex items-center justify-center text-(--brand) hover:bg-(--bg-hover) hover:cursor-pointer rounded-xl transition-all border border-transparent hover:border-(--border-200)" title="${i18next.t('components.edit')}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button data-id="${product.id}" class="delete-btn w-10 h-10 flex items-center justify-center text-(--danger-text) hover:bg-(--danger-bg) hover:cursor-pointer rounded-xl transition-all border border-transparent hover:border-(--danger-border)" title="${i18next.t('components.delete')}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                </div>
            </td>
        </tr>`
}