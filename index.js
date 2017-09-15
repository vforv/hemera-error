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


                let user = {
                    firstName: userPeyload.firstName,
                    lastName: userPeyload.lastName,
                    email: userPeyload.email,
                    password: 'hash',
                    phone: userPeyload.phone,
                    role: userPeyload.role,
                    address: userPeyload.address,
                    city: userPeyload.city,
                    state: userPeyload.state,
                    country: userPeyload.country,
                    zip: userPeyload.zip,
                    bankId: userPeyload.bankId
                }

                hemera.act({
                    topic: 'mongo-store',
                    cmd: 'find',
                    collection: 'users',
                    query: { email: userPeyload.email }
                }, (err, resp) => {
                    if (err) {
                        done(err);
                    }

                    if (resp.result.length === 0) {

                        hemera.act({
                            topic: 'mongo-store',
                            cmd: 'create',
                            collection: 'users',
                            data: user
                        }, (err, resp) => {
                            if (err) {
                                done(null, err);
                            }

                            //TODO: call mail service here
                            done(null, 'We sent you activation link to the mail.');
                        })

                    } else {
                        const UnauthorizedError = hemera.createError("Unauthorized");
                        const mess = new UnauthorizedError("User already exists.");
                        done(mess);
                    }
                })
            });

            const userData = {
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
            // stub act calls
            actStub.stub({
                topic: 'mongo-store',
                cmd: 'create',
                collection: 'users',
                data: userData
            }, null, "Mail sent")

            actStub.stub({
                topic: 'mongo-store',
                cmd: 'find',
                collection: 'users',
                query: { email: 'vladimir@some.com' }
            }, null, { result: [] })

            // Important run it when "add" was already added
            // Should execute the server method with the pattern topic:math,cmd:add,a:100,b:200"
            AddStub.run(hemera, { topic: 'user', cmd: 'login' }, { user: userData }, function (err, result) {

                done()
            })



        })
    })
})
