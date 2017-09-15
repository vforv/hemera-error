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
                hemera.act({
                    topic: 'user-credentials',
                    cmd: 'verify',
                    email: msg.email,
                    password: msg.password
                }, (err, user) => {
                    if (err) {
                        done(err)
                    }
                    console.log("HELLO")
                    if (!user) {
                        const UnauthorizedError = hemera.createError("Unauthorized");
                        const mess = new UnauthorizedError("User credentials not valid.");
                        done(mess);
                    }

                    this.act({
                        topic: 'jwt',
                        cmd: 'generate',
                        userId: user._id
                    }, (err, resp) => {
                        if (err) {
                            done(err)
                        }
                        
                        console.log("HERE NOT WORKING")
                        done(null, { token: resp })
                    });

                });
            });
            // stub act calls
            actStub.stub({ topic: 'jwt', cmd: 'generate', userId: '123' }, null, 50)
            actStub.stub({ topic: 'user-credentials', cmd: 'verify', email: 'vladimir@some.com', password: 'test123' }, null, 300)

            // Important run it when "add" was already added
            // Should execute the server method with the pattern topic:math,cmd:add,a:100,b:200"
            AddStub.run(hemera, { topic: 'user', cmd: 'login' }, { email: 'vladimir@some.com', password: 'test123' }, function (err, result) {

                done()
            })



        })
    })
})
