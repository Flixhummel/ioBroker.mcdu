'use strict';

const { expect } = require('chai');
const PageRenderer = require('../../lib/rendering/PageRenderer');
const { createMockAdapter, createMockDisplayPublisher } = require('./testHelper');

describe('PageRenderer', () => {
    let adapter;
    let displayPublisher;
    let renderer;

    beforeEach(() => {
        adapter = createMockAdapter({
            pages: [
                {
                    id: 'home-main',
                    name: 'Home',
                    lines: [
                        { row: 1, display: { type: 'label', label: 'WELCOME' } },
                        { row: 3, subLabel: 'TEMPERATUR', display: { type: 'label', label: '21.5 C' } },
                        { row: 5, display: { type: 'label', label: 'LIGHTS' } },
                    ]
                },
                {
                    id: 'long-page',
                    name: 'Long List',
                    lines: [
                        { row: 101, display: { type: 'label', label: 'ITEM 1' } },
                        { row: 102, display: { type: 'label', label: 'ITEM 2' } },
                        { row: 103, display: { type: 'label', label: 'ITEM 3' } },
                        { row: 104, display: { type: 'label', label: 'ITEM 4' } },
                        { row: 105, display: { type: 'label', label: 'ITEM 5' } },
                        { row: 106, display: { type: 'label', label: 'ITEM 6' } },
                        { row: 107, display: { type: 'label', label: 'ITEM 7' } },
                        { row: 108, display: { type: 'label', label: 'ITEM 8' } },
                        { row: 109, display: { type: 'label', label: 'ITEM 9' } },
                    ]
                },
                {
                    id: 'sub-labels-page',
                    name: 'Sub Labels',
                    lines: [
                        { row: 1, display: { type: 'label', label: 'TITLE' } },
                        { row: 3, subLabel: 'WOHNZIMMER', display: { type: 'label', label: '21.5 C' } },
                        { row: 5, subLabel: 'KÜCHE', display: { type: 'label', label: '19.0 C' } },
                        { row: 7, display: { type: 'label', label: 'NO SUB' } },
                    ]
                }
            ]
        });
        displayPublisher = createMockDisplayPublisher();
        renderer = new PageRenderer(adapter, displayPublisher);
    });

    describe('Even Row Sub-Labels', () => {
        it('should render sub-labels on even rows for the next odd row', async () => {
            await renderer.renderPage('sub-labels-page');

            const lines = displayPublisher._published[0];
            // Row 2 (index 1) should have sub-label for row 3
            expect(lines[1].text).to.include('WOHNZIMMER');
            expect(lines[1].color).to.equal('cyan');

            // Row 4 (index 3) should have sub-label for row 5
            expect(lines[3].text).to.include('KÜCHE');
            expect(lines[3].color).to.equal('cyan');
        });

        it('should render blank even rows when no sub-label is defined', async () => {
            await renderer.renderPage('sub-labels-page');

            const lines = displayPublisher._published[0];
            // Row 6 (index 5) — row 7 has no subLabel
            expect(lines[5].text.trim()).to.equal('');
            expect(lines[5].color).to.equal('cyan');
        });

        it('should render all even rows (2,4,6,8,10) as cyan', async () => {
            await renderer.renderPage('home-main');

            const lines = displayPublisher._published[0];
            const evenIndices = [1, 3, 5, 7, 9]; // rows 2,4,6,8,10
            for (const idx of evenIndices) {
                expect(lines[idx].color).to.equal('cyan');
            }
        });
    });

    describe('Status Bar (Row 13)', () => {
        it('should render status bar on row 13', async () => {
            await renderer.renderPage('home-main');

            const lines = displayPublisher._published[0];
            // Row 13 is index 12
            const statusBar = lines[12];
            expect(statusBar.color).to.equal('cyan');
            expect(statusBar.text).to.include('HOME');
        });

        it('should include HH:MM time in status bar', async () => {
            await renderer.renderPage('home-main');

            const lines = displayPublisher._published[0];
            const statusBar = lines[12];
            // Should contain time in HH:MM format
            expect(statusBar.text).to.match(/\d{2}:\d{2}/);
        });

        it('should show page indicator when paginated', async () => {
            // Force pagination by using a page with >6 odd-row items
            await renderer.renderPage('long-page');

            const lines = displayPublisher._published[0];
            const statusBar = lines[12];
            // Should show "1/2" since 9 items on 2 pages
            expect(statusBar.text).to.include('1/2');
        });

        it('should not show page indicator for single-page content', async () => {
            await renderer.renderPage('home-main');

            const lines = displayPublisher._published[0];
            const statusBar = lines[12];
            // Should not contain X/Y page indicator
            expect(statusBar.text).to.not.match(/\d+\/\d+/);
        });

        it('should be exactly 24 characters wide', async () => {
            await renderer.renderPage('home-main');

            const lines = displayPublisher._published[0];
            const statusBar = lines[12];
            expect(statusBar.text.length).to.equal(24);
        });
    });

    describe('renderStatusBar()', () => {
        it('should use page name in uppercase', () => {
            const result = renderer.renderStatusBar('home-main');
            expect(result.text).to.include('HOME');
            expect(result.color).to.equal('cyan');
        });

        it('should fallback to pageId if no name', () => {
            adapter.config.pages.push({ id: 'no-name-page', lines: [] });
            const result = renderer.renderStatusBar('no-name-page');
            expect(result.text).to.include('NO-NAME-PAGE');
        });

        it('should truncate long page names', () => {
            adapter.config.pages.push({ id: 'x', name: 'A Very Long Page Name That Exceeds', lines: [] });
            const result = renderer.renderStatusBar('x');
            expect(result.text.length).to.equal(24);
        });
    });

    describe('Pagination', () => {
        it('should paginate pages with >6 odd-row items', async () => {
            await renderer.renderPage('long-page');

            expect(renderer.totalPages).to.equal(2);
            expect(renderer.currentPageOffset).to.equal(0);
        });

        it('should not paginate pages with <=6 odd-row items', async () => {
            await renderer.renderPage('home-main');

            expect(renderer.totalPages).to.equal(1);
            expect(renderer.currentPageOffset).to.equal(0);
        });

        it('should render first 6 items on page 1', async () => {
            await renderer.renderPage('long-page');

            const lines = displayPublisher._published[0];
            // Row 1 (index 0) should be ITEM 1
            expect(lines[0].text).to.include('ITEM 1');
            // Row 11 (index 10) should be ITEM 6
            expect(lines[10].text).to.include('ITEM 6');
        });

        it('should render remaining items on page 2', async () => {
            renderer.currentPageOffset = 1;
            await renderer.renderPage('long-page');

            const lines = displayPublisher._published[0];
            // Row 1 (index 0) should be ITEM 7
            expect(lines[0].text).to.include('ITEM 7');
            // Row 3 (index 2) should be ITEM 8
            expect(lines[2].text).to.include('ITEM 8');
            // Row 5 (index 4) should be ITEM 9
            expect(lines[4].text).to.include('ITEM 9');
        });

        it('should clamp currentPageOffset to valid range', async () => {
            renderer.currentPageOffset = 99;
            await renderer.renderPage('long-page');

            expect(renderer.currentPageOffset).to.equal(1); // max page index for 2 pages
        });

        it('should reset pagination for non-paginated pages', async () => {
            renderer.currentPageOffset = 5;
            renderer.totalPages = 10;

            await renderer.renderPage('home-main');

            expect(renderer.totalPages).to.equal(1);
            expect(renderer.currentPageOffset).to.equal(0);
        });
    });

    describe('padOrTruncate', () => {
        it('should pad short text', () => {
            expect(renderer.padOrTruncate('abc', 6)).to.equal('abc   ');
        });

        it('should truncate long text', () => {
            expect(renderer.padOrTruncate('abcdef', 3)).to.equal('abc');
        });

        it('should return exact-length text unchanged', () => {
            expect(renderer.padOrTruncate('abc', 3)).to.equal('abc');
        });
    });

    describe('alignText', () => {
        it('should left-align by default', () => {
            const result = renderer.alignText('hi', 'left', 10);
            expect(result).to.equal('hi        ');
        });

        it('should right-align', () => {
            const result = renderer.alignText('hi', 'right', 10);
            expect(result).to.equal('        hi');
        });

        it('should center-align', () => {
            const result = renderer.alignText('hi', 'center', 10);
            expect(result).to.equal('    hi    ');
        });
    });

    describe('Rendering Output', () => {
        it('should produce exactly 14 lines', async () => {
            await renderer.renderPage('home-main');

            const lines = displayPublisher._published[0];
            expect(lines).to.have.length(14);
        });

        it('should have all lines at 24 chars', async () => {
            await renderer.renderPage('home-main');

            const lines = displayPublisher._published[0];
            for (const line of lines) {
                expect(line.text.length).to.equal(24);
            }
        });

        it('should render error page for unknown page ID', async () => {
            await renderer.renderPage('nonexistent');

            const lines = displayPublisher._published[0];
            // Should show error message
            const hasError = lines.some(l => l.text.includes('NICHT GEFUNDEN') && l.color === 'red');
            expect(hasError).to.be.true;
        });
    });
});
