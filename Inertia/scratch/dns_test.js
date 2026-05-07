const dns = require('dns');

const host = 'cluster0.pv2o7bv.mongodb.net';

dns.resolveSrv('_mongodb._tcp.' + host, (err, addresses) => {
    if (err) {
        console.error('SRV Resolution Error:', err);
    } else {
        console.log('SRV Records:', addresses);
        addresses.forEach(addr => {
            dns.lookup(addr.name, (err, address, family) => {
                if (err) {
                    console.error(`Lookup Error for ${addr.name}:`, err);
                } else {
                    console.log(`Lookup for ${addr.name}: ${address} (family: ${family})`);
                }
            });
        });
    }
});
