function foo() {

    console.log('2');
    return 'b';
}

async function main() {
    console.log('1');
    const b = foo();
    const c = (b instanceof Promise) ? await b : b;
    console.log('3');
    console.log('b', b);
    console.log('c', c);
}
console.log('4');

main();
console.log('5');