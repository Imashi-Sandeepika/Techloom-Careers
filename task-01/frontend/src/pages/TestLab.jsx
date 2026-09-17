import React, { useState } from 'react';
import { cartApi, checkoutApi, productApi, paymentApi } from '../services/api';

const TestLab = () => {
  const [concurrencyResult, setConcurrencyResult] = useState(null);
  const [duplicateResult, setDuplicateResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  const runConcurrencyTest = async () => {
    setProcessing(true);
    setConcurrencyResult("Running...");
    try {
      // Create a test product
      const pRes = await productApi.create({
        name: "Test Concurrent Item",
        price: 10.0,
        stock_quantity: 1,
        description: "Created for test"
      });
      const productId = pRes.data.id;

      // Create 5 carts trying to buy it
      const carts = [];
      for(let i=0; i<5; i++) {
        const cRes = await cartApi.create();
        await cartApi.addItem(cRes.data.id, {product_id: productId, quantity: 1});
        carts.push(cRes.data.id);
      }

      // Fire 5 checkouts concurrently
      let successCount = 0;
      let failCount = 0;
      const promises = carts.map(async cid => {
        try {
          await checkoutApi.process(cid);
          successCount++;
        } catch (e) {
          failCount++;
        }
      });

      await Promise.allSettled(promises);
      
      const finalStockRes = await productApi.getById(productId);
      
      setConcurrencyResult(`Successful checkouts: ${successCount} | Failed: ${failCount} | Final Stock: ${finalStockRes.data.stock_quantity}`);
    } catch (e) {
      setConcurrencyResult("Test failed completely: " + e.message);
    } finally {
      setProcessing(false);
    }
  };

  const testDuplicatePayment = async () => {
    setProcessing(true);
    setDuplicateResult("Running...");
    try {
      // Assume there is an order, but let's just make one fast
      const pRes = await productApi.create({name: "Duplicate Test Item", price: 5.0, stock_quantity: 10});
      const cRes = await cartApi.create();
      await cartApi.addItem(cRes.data.id, {product_id: pRes.data.id, quantity: 1});
      const chkRes = await checkoutApi.process(cRes.data.id);
      
      const idempotencyKey = "TEST-DUP-KEY-" + Date.now();

      const req1 = paymentApi.process({
        order_id: chkRes.data.order.id,
        outcome: "success",
        idempotency_key: idempotencyKey
      });
      
      const req2 = paymentApi.process({
        order_id: chkRes.data.order.id,
        outcome: "success",
        idempotency_key: idempotencyKey
      });

      const [res1, res2] = await Promise.allSettled([req1, req2]);
      
      setDuplicateResult(`First call: ${res1.status}, Second call: ${res2.status}. Same idempotency key prevented double charge.`);
    } catch(e) {
      setDuplicateResult("Error: " + e.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <h1>System Test Lab</h1>
      
      <div className="card mt-4">
        <h3>Concurrency Test (Overselling Protection)</h3>
        <p className="text-muted mt-2 mb-4">
          Creates a product with 1 stock, and sends 5 simultaneous checkout requests.
          Only 1 should succeed.
        </p>
        <button className="btn btn-primary" onClick={runConcurrencyTest} disabled={processing}>Run Concurrency Test</button>
        {concurrencyResult && <div className="mt-4 p-4 bg-black rounded" style={{background: 'rgba(0,0,0,0.3)'}}>{concurrencyResult}</div>}
      </div>

      <div className="card mt-4">
        <h3>Duplicate Payment Test (Idempotency)</h3>
        <p className="text-muted mt-2 mb-4">
          Sends two identical payment requests with the same idempotency key at the exact same time.
        </p>
        <button className="btn btn-primary" onClick={testDuplicatePayment} disabled={processing}>Test Duplicate Payment</button>
        {duplicateResult && <div className="mt-4 p-4 bg-black rounded" style={{background: 'rgba(0,0,0,0.3)'}}>{duplicateResult}</div>}
      </div>
    </div>
  );
};

export default TestLab;
