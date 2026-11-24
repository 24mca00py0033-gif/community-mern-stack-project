import http from 'k6/http';

import { check, sleep } from 'k6';


export const options = {

    stages: [

        // First 30 seconds: 10 users
        { duration: '30s', target: 10 },

        // Next 1 minute: 50 users
        { duration: '1m', target: 50 },

        // Next 1 minute: 100 users
        { duration: '1m', target: 100 },

        // Next 2 minutes: 500 users
        { duration: '2m', target: 500 },

        // Next 3 minutes: 1000 users
        { duration: '3m', target: 1000 },

        // Maintain 1000 users for 2 minutes
        { duration: '2m', target: 1000 },

        // Gradually stop
        { duration: '30s', target: 0 }

    ],

    thresholds: {

        http_req_failed: ['rate<0.01'],

        http_req_duration: ['p(95)<1000']

    }

};


export default function () {

    const response = http.get(
        'http://localhost:5000/api/health'
    );

    check(response, {

        'Status is 200': (r) => r.status === 200,

        'Response time below 1 second':
            (r) => r.timings.duration < 1000

    });

    sleep(1);

}