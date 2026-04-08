import app from '../js/app.js';
const { calculateMetrics, treeData } = app;
import { describe, test, expect } from 'vitest';

describe('calculateMetrics', () => {
    test('returns null for invalid or <= 0 volume', () => {
        expect(calculateMetrics(0, 'L')).toBeNull();
        expect(calculateMetrics(-5, 'G')).toBeNull();
        expect(calculateMetrics(NaN, 'L')).toBeNull();
    });

    test('calculates correct metrics for 20 Liters', () => {
        const result = calculateMetrics(20, 'L');
        expect(result.density).toBe(10000);
        expect(result.harvest).toBe(2500);
        expect(result.feed).toBe(0.05);
        expect(result.exchangeLiters).toBe(4);
        expect(result.hufaLiters).toBe(20);
    });

    test('calculates correct metrics for 5 Gallons', () => {
        // 5 Gallons = 18.92705 Liters
        const result = calculateMetrics(5, 'G');
        expect(result.density).toBe(9463);
        expect(result.harvest).toBe(2365);
        expect(result.feed).toBe(0.047);
        // exchange ~3.78 L -> 1 Gal
    });
});

describe('treeData', () => {
    test('has start node with options', () => {
        expect(treeData.start).toBeDefined();
        expect(treeData.start.opts.length).toBeGreaterThan(0);
        expect(treeData.start.opts[0].next).toBe('cloudy');
    });

    test('has danger nodes configured properly', () => {
        expect(treeData.cloudy.danger).toBe(true);
        expect(treeData.fungal.danger).toBe(false);
    });
});
