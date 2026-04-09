// @vitest-environment jsdom
import app from '../js/app.js';
const { calculateMetrics, treeData, saveSettings, loadSettings, generateSchedule } = app;
import { describe, test, expect, beforeEach } from 'vitest';

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
        const result = calculateMetrics(5, 'G');
        expect(result.density).toBe(9463);
        expect(result.harvest).toBe(2365);
        expect(result.feed).toBe(0.047);
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

describe('LocalStorage & Settings', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('loadSettings returns null if empty', () => {
        expect(loadSettings()).toBeNull();
    });

    test('saveSettings and loadSettings work properly', () => {
        saveSettings(10, 'G');
        const settings = loadSettings();
        expect(settings.volume).toBe(10);
        expect(settings.unit).toBe('G');
    });
});

describe('14-day Schedule Logic', () => {
    test('generateSchedule returns 14 days of events', () => {
        const start = new Date('2026-04-01T12:00:00Z');
        const schedule = generateSchedule(start, 20, 'L');
        
        expect(schedule.length).toBe(14);
        expect(schedule[0].date.toISOString().startsWith('2026-04-01')).toBe(true);
        expect(schedule[0].action).toContain('Feed');
        
        // Day 4 (index 3) should include harvest
        expect(schedule[3].action).toContain('Harvest');
        
        // Day 7 (index 6) should include water change
        expect(schedule[6].action).toContain('Water Change');
    });
});
