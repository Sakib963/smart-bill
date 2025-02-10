import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class InvoiceComponent {
  products = [
    { name: 'Product A', quantity: 1, price: 100 },
    { name: 'Product B', quantity: 2, price: 50 },
  ];

  totalPrice = 0;
  barcodeDataUrl = '';

  constructor() {
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalPrice = this.products.reduce(
      (sum, p) => sum + p.quantity * p.price,
      0
    );
  }

  generateBarcode(value: string) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = 'black';
      ctx.fillRect(10, 10, 2, 50); // Dummy barcode example
      ctx.fillRect(20, 10, 4, 50);
      ctx.fillRect(30, 10, 2, 50);
      ctx.fillRect(40, 10, 6, 50);
    }

    this.barcodeDataUrl = canvas.toDataURL();
  }

  async connectToPrinter() {
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access'],
      });

      const server = await device.gatt?.connect();
      console.log('Connected to printer:', device.name);
    } catch (error) {
      console.error('Error connecting to printer:', error);
    }
  }

  async printInvoice() {
    try {
      const encoder = new TextEncoder();
      const printData = `
        My Store
        ---------------
        Item   Qty   Price
        ${this.products
          .map((p) => `${p.name}  ${p.quantity}  $${p.price}`)
          .join('\n')}
        ---------------
        Total: $${this.totalPrice}
      `;

      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access'],
      });

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('generic_access');
      const characteristic = await service?.getCharacteristic('generic_access');

      if (characteristic) {
        await characteristic.writeValue(encoder.encode(printData));
        console.log('Invoice sent to printer.');
      }
    } catch (error) {
      console.error('Printing error:', error);
    }
  }
}
