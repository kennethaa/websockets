'use strict';

export default {
    events(primus) {
        let counter = 1;

        setInterval(() => {
            primus.write(counter);
            counter++;
        }, 1000);
    }
};
