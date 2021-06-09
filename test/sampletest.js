var expect  = require('chai').expect;
var assert  = require('chai').assert;
var should  = require('chai').should;
var request = require('request');


describe('1) MAIN PAGE', function(done){
    it('content', function(done) {
        request('http://localhost:5000/overview' , function(error, response, body) {
            expect(response.statusCode).to.equal(200);   
            done();
        });
    });
    });


describe('2) LOGIN PAGE', function(done){
    it('content', function(done) {
        request('http://localhost:5000/users/login' , function(error, response, body) {
        expect(response.statusCode).to.equal(200);   
        done();
        });
    });
    it('Should be success if credential is non empty', function(done) {
        let email='aaa@aa.com';
        let password='aaaaaa';
        request.get('http://localhost:5000/users/login?email='+email+'&&password='+password,function(error,response,body)
        {
            expect(response.statusCode).to.equal(200); 
            done();
        });
    });
    it('Should be failure if credential is empty', function(done) {
        let email='aa';
        let password='aa';
        request.get('http://localhost:5000/users/login?email='+email+'&password='+password,function(error,response,body)
        {
            expect(email).length.above(0);
            expect(password).length.above(0);
            done();
        });
    });

    it('Should be failure if password is below 6 charecters', function(done) {
        let email='12456';
        let password='aaaaaa';
        //
        request.get('http://localhost:5000/users/login?email='+email+'&password='+password,function(error,response,body)
        {
            expect(password).length.above(5);   
            done();
        });
    });
});
describe('3) REGISTRATION PAGE', function(done){
    it('content', function(done) {
        request('http://localhost:5000/users/register' , function(error, response, body) {
        expect(response.statusCode).to.equal(200);   
        done();
        });
    });
    it('Should be success if credential is non empty', function(done) {
        let first_name='aa';
        let last_name='aa';
        let email='aaa@aa.com';
        let password='aaaaaa';
        let password2='aaaaaa';
        request.get('http://localhost:5000/users/register?first_name='+first_name+'&last_name='+last_name+'&email='+email+'&password='+password+'&password2='+password2,function(error,response,body)
        {
            expect(response.statusCode).to.equal(200); 
            done();
        });
    });
    it('Should be failure if credential is empty', function(done) {
        let first_name='aa';
        let last_name='aa';
        let email='aaa@aa.com';
        let password='aaaaaa';
        let password2='aaaaaa';
        request.get('http://localhost:5000/users/register?first_name='+first_name+'&last_name='+last_name+'&email='+email+'&password='+password+'&password2='+password2,function(error,response,body)
        {
            expect(email).length.above(0);
            expect(password).length.above(0);
            expect(password2).length.above(0);
            expect(first_name).length.above(0);
            expect(last_name).length.above(0);
            done();
        });
    });
    it('Should be failure if name is not of type string', function(done) {
        let first_name='aa';
        let last_name='aa';
        let email='aaa@aa.com';
        let password='aaaaaa';
        let password2='aaaaaa';
        request.get('http://localhost:5000/users/register?first_name='+first_name+'&last_name='+last_name+'&email='+email+'&password='+password+'&password2='+password2,function(error,response,body)
        {
            assert.isString(first_name);
            assert.isString(last_name);
            done();
        });
    });
    it('Should be failure if password is below 6 charecters', function(done) {
        let first_name='aa';
        let last_name='aa';
        let email='a@.com';
        let password='aaaaaa';
        let password2='aaaaaa';
        request.get('http://localhost:5000/users/register?first_name='+first_name+'&last_name='+last_name+'&email='+email+'&password='+password+'&password2='+password2,function(error,response,body)
        {
            expect(password).length.above(5);   
            done();
        });
    });
    it('Should be failure if passwords donot match', function(done) {
        let first_name='aa';
        let last_name='aa';
        let email='aaa@aa.com';
        let password='aaaaaa';
        let password2='aaaaaa';
        request.get('http://localhost:5000/users/register?first_name='+first_name+'&last_name='+last_name+'&email='+email+'&password='+password+'&password2='+password2,function(error,response,body)
        {
            expect(password).to.be.equal(password2)   
            done();
        });
    });
});
describe('4) PROFILE PAGE', function(done){
    it('content', function(done) {
        request('http://localhost:5000/profile' , function(error, response, body) {
        expect(response.statusCode).to.equal(200);   
        done();
        });
    });
});
describe('5) SEARCH PAGE', function(done){
    it('content', function(done) {
        request('http://localhost:5000/search' , function(error, response, body) {
        expect(response.statusCode).to.equal(200);   
        done();
        });
    });
    it('Search based on keyword', function(done) {
        let keyword='keyword';
        let query='robotics';
        request.get('http://localhost:5000/search?category='+keyword+'&query='+query,function(error,response,body)
        {
        expect(response.statusCode).to.equal(200);   
        done();
        });
    });
    it('Search based on author', function(done) {
        let keyword='author';
        let query='14026094500';
        request.get('http://localhost:5000/search?category='+keyword+'&query='+query,function(error,response,body)
        {
        expect(response.statusCode).to.equal(200);   
        done();
        });
    });
    it('Search based on publication', function(done) {
        let keyword='publication';
        let query='85105154563';
        request.get('http://localhost:5000/search?category='+keyword+'&query='+query,function(error,response,body)
        {
        expect(response.statusCode).to.equal(200);   
        done();
        });
    });
});
describe('6) QUERY PAGE', function(done){
    it('Should not be able to access query page directly', function(done) {
        request('http://localhost:5000/query' , function(error, response, body) {
        expect(response.statusCode).to.equal(404);   
        done();
        });
    });
});