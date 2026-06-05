const fs = require('fs');
const file = '/Users/nathanaelricosetiawan/Documents/Kuliah/Coding Camp 2026/naviance/Frontend/navience-frontend/src/views/Dashboard.vue';

let content = fs.readFileSync(file, 'utf8');

const targetStartMarker = '<!-- Widget: Target Tabungan -->';
const targetStartIndex = content.indexOf(targetStartMarker);

// Find the end of the div
// It's just before `</section>` which is before `<!-- Recent Transactions -->`
const sectionEndMarker = '</section>\n\n        <!-- Recent Transactions -->';
const sectionEndIndex = content.indexOf(sectionEndMarker);

if (targetStartIndex === -1 || sectionEndIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

// The target widget string
let targetStr = content.slice(targetStartIndex, sectionEndIndex);

// Remove the target widget from the content
content = content.slice(0, targetStartIndex) + content.slice(sectionEndIndex);

// Adjust the Bento Grid to just be a normal single column grid
content = content.replace(
    '<!-- Middle Section: Bento Grid -->\n        <section class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">\n\n          <!-- Chart Area: Ringkasan Bulanan (Span 2 cols) -->\n          <div\n            class="lg:col-span-2',
    '<!-- Middle Section: Chart Area -->\n        <section class="grid grid-cols-1 gap-gutter">\n\n          <!-- Chart Area: Ringkasan Bulanan -->\n          <div\n            class="'
);

// We need to unwrap targetStr from `<div class="lg:col-span-1 flex flex-col gap-gutter">`
// targetStr looks like:
// <!-- Widget: Target Tabungan -->
//           <div class="lg:col-span-1 flex flex-col gap-gutter">
//             <div
//               class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 flex-1"
//               id="card-target-tabungan"
//             >
//               ...
//             </div>
//           </div>
// 

targetStr = targetStr.replace('<div class="lg:col-span-1 flex flex-col gap-gutter">\n            <div\n              class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 flex-1"', '<div\n            class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 w-full"');
// remove the last `          </div>\n`
targetStr = targetStr.trimEnd();
if (targetStr.endsWith('</div>')) {
    targetStr = targetStr.slice(0, -6).trimEnd();
}

const newTargetSection = `<!-- Target Tabungan Widget -->\n        <section class="w-full">\n${targetStr}\n        </section>\n\n        `;

// Insert above Metrics Grid
const metricsMarker = '<!-- Top Row: Metrics Grid -->';
content = content.replace(metricsMarker, newTargetSection + metricsMarker);

fs.writeFileSync(file, content);
console.log("Move successful.");

