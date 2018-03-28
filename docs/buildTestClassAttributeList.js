const fs = require('fs');
const lower = "abcdefghijklmnopqrstuvwxyz";

const items = [];

fs.readdirSync(".").forEach(file => {
    if(file.endsWith(".md")){
        const fileContent = fs.readFileSync(file).toString();
        for(let line of fileContent.split("\n")){
            if(line.startsWith("# ") && lower.indexOf(line[2]) >= 0){
                items.push({
                    name: line.slice(2),
                    file: file
                });
            }
        }
    }
})

items.sort((a, b) => {
    if(a.name < b.name) return -1;
    if(a.name > b.name) return +1;
    return 0;
});

for(let item of items){
    console.log(`- [${item.name}](${item.file}#${item.name.toLowerCase()})`);
}
