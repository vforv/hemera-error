'use strict'

/**
 * Run mocha ./examples/unittest.js
 */

const Hemera = require('nats-hemera')
const Nats = require('hemera-testsuite/natsStub')
const ActStub = require('hemera-testsuite/actStub')
const AddStub = require('hemera-testsuite/addStub')
const Code = require('code')
const lab = require('lab');
const expect = Code.expect
const L = exports.lab = lab.script();
const bcrypt = require('bcrypt')

L.describe('Math', function () {
    L.it('Should do some math operations', function (done) {
        const nats = new Nats()
        const hemera = new Hemera(nats, {
            logLevel: 'info'
        })
        const actStub = new ActStub(hemera)

        hemera.ready(function () {
            this.add({
                topic: 'user',
                cmd: 'login'
            }, function (msg, cb) {
                let __this = this;
                let hemera = __this;

                let userPeyload = msg.user;

                bcrypt.hash('test123', 10).then((hash) => {
                    let user = {
                        hash: hash
                    }

                    hemera.act({
                        topic: 'mongo-store',
                        cmd: 'create',
                        collection: 'users',
                        data: user
                    }, (err, resp) => {
                        if (err) {
                            cb(null, err);
                        }
                        console.log(hash)
                        //TODO: call mail service here
                        cb(null, 'We sent you activation link to the mail.');
                    })
                })
            });


            const userData = {
                hash: 'somehash'
            }
            // stub act calls

            actStub.stub({
                topic: 'mongo-store',
                cmd: 'create',
                collection: 'users',
                data: userData
            }, null, "Mail sent")

            AddStub.run(hemera, { topic: 'user', cmd: 'login' }, {
                user: {
                    firstName: 'Vladimir',
                    lastName: 'Djukic',
                    email: 'vladimir@some.com',
                    password: 'hash',
                    phone: '123123123',
                    role: ['admin'],
                    address: 'Cuk br.3',
                    city: 'Berane',
                    state: 'IL',
                    country: 'MNT',
                    zip: '123',
                    bankId: '123'
                }
            }, function (err, result) {

                done()
            })



        })
    })
})
