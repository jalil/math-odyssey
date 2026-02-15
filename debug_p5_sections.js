const fs = require('fs');
const topics = JSON.parse(fs.readFileSync('./src/data/topics.json', 'utf8'));
const p5 = topics.find(t => t.id === 'singapore-p5');
if (p5) {
    const sections = p5.sections.filter(s => s.type === 'section-header');
    console.log(JSON.stringify(sections.map(s => ({ id: s.id, title: s.title })), null, 2));
} else {
    console.log('P5 not found');
}
