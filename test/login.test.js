import 'dotenv/config';
import request from 'supertest'
import { expect } from 'chai';
import { obterToken } from '../helpers/autenticacao.js';
import postLogin from '../fixtures/postLogin.json' with {type: 'json'};

describe('Autenticação', () => {
    describe('POST /auth/login', () => {
        it('deve retornar 200 ao autenticar com credenciais válidas', async () => {
            const resposta = await request(process.env.BASE_URL)
                .post('/auth/login')
                .set('Content-Type', 'application/json')
                .send(postLogin.usuarioValido);

            expect(resposta.status).to.equal(200);
            expect(resposta.body.message).to.equal('Login realizado com sucesso!');
            expect(resposta.body.token).to.be.a('string');
            expect(resposta.body.status).to.equal('success');
            expect(resposta.body.usuario.nome).to.equal(postLogin.usuarioEsperado.nome);
            expect(resposta.body.usuario.email).to.equal(postLogin.usuarioEsperado.email);

        });

        it('deve retornar 401 quando o usuário informar credenciais inválidas', async () => {
            const resposta = await request(process.env.BASE_URL)
                .post('/auth/login')
                .set('Content-Type', 'application/json')
                .send(postLogin.usuarioInvalido);

            expect(resposta.status).to.equal(401);
            expect(resposta.body.message).to.equal('E-mail ou senha inválidos.');
            expect(resposta.body.status).to.equal('error');

        });

        it('deve retornar 422 quando um campo obrigatório não for informado', async () => {
            const resposta = await request(process.env.BASE_URL)
                .post('/auth/login')
                .set('Content-Type', 'application/json')
                .send(postLogin.semInformarSenha);

            expect(resposta.status).to.equal(422);
            expect(resposta.body.message).to.equal('E-mail e senha são obrigatórios.');
            expect(resposta.body.status).to.equal('error');

        });
    });

    describe('GET /auth/me', () => {
        it('deve retornar 200 com os dados do usuário autenticado', async () => {
            const token = await obterToken(postLogin.usuarioValido);
            const resposta = await request(process.env.BASE_URL)
                .get('/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(resposta.status).to.equal(200);
            expect(resposta.body.status).to.equal('success');
            expect(resposta.body.data.email).to.equal(postLogin.usuarioEsperado.email);
        });

        it('deve retornar 401 quando o token não for informado', async () => {
            const resposta = await request(process.env.BASE_URL)
                .get('/auth/me');
            expect(resposta.status).to.equal(401);
            expect(resposta.body.status).to.equal('error')
            expect(resposta.body.message).to.equal('Token não informado. Faça login para continuar.')
        });
    });
});
