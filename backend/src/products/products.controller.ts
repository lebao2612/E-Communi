import { Controller, Get, Query } from '@nestjs/common';

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
}

@Controller('products')
export class ProductsController {

    private products: Product[] = [
        { id: 1, name: "iPhone 15", price: 1200, category: "Điện thoại" },
        { id: 2, name: "Samsung Galaxy S23", price: 1100, category: "Điện thoại" },
        { id: 3, name: "MacBook Air M2", price: 1500, category: "Laptop" },
        { id: 4, name: "Dell XPS 15", price: 1800, category: "Laptop" },
        { id: 5, name: "Sony WH-1000XM5", price: 400, category: "Tai nghe" },
        { id: 6, name: "AirPods Pro 2", price: 250, category: "Tai nghe" }
    ];

    @Get()
    getAll() {
        return this.products;
    }

    @Get('search')
    search(@Query('q') query: string) {
        if(!query){
            return { 
                message: "Vui lòng nhập từ khóa tìm kiếm",
                products: []
            };

        }

        const result = this.products.filter(product => product.name.toLowerCase().includes(query.toLowerCase()));

        return {
            message: `Tìm thấy ${result.length} sản phẩm`,
            products: result
        }
    }
}
