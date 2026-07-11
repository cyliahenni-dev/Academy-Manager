// شغّل هذا لتشخيص المشكلة
const fs = require('fs');
const path = require('path');

const routesDir = path.join(process.cwd(), 'routes');
const files = fs.readdirSync(routesDir);

console.log('=== فحص ملفات routes ===');
files.forEach(f => {
    const fullPath = path.join(routesDir, f);
    try {
        const mod = require(fullPath);
        console.log(`✅ ${f} → type: ${typeof mod} | is router: ${typeof mod === 'function' ? 'YES' : 'NO - ' + Object.keys(mod)}`);
    } catch(e) {
        console.log(`❌ ${f} → خطأ: ${e.message}`);
    }
});