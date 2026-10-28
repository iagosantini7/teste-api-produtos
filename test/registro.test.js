import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { expect } from 'chai';
import postRegistroUsuario from '../fixtures/postRegistroUsuario.json' with {type: 'json'};

describe('Cadastro de usuário', () => {
    describe('POST /auth/register', () => {
        it('deve retornar 201 ao cadastrar um usuário válido', async () => {
            const usuario = {
                ...postRegistroUsuario.cadastroUsuarioValido,
                email: `usuario-${randomUUID()}@example.com`
            };
            const resposta = await request(process.env.BASE_URL)
                .post('/auth/register')
                .set('Content-Type', 'application/json')
                .send(usuario);

            expect(resposta.status).to.equal(201);
            expect(resposta.body.status).to.equal('success');
            expect(resposta.body.message).to.equal('Usuário criado com sucesso!');
        });

        it('deve retornar 409 quando o e-mail informado já estiver cadastrado', async () => {
            const usuario = {
                ...postRegistroUsuario.cadastroUsuarioValido,
                email: `usuario-duplicado-${randomUUID()}@example.com`
            };
            const primeiraResposta = await request(process.env.BASE_URL)
                .post('/auth/register')
                .set('Content-Type', 'application/json')
                .send(usuario);

            expect(primeiraResposta.status).to.equal(201);

            const resposta = await request(process.env.BASE_URL)
                .post('/auth/register')
                .set('Content-Type', 'application/json')
                .send(usuario);

            expect(resposta.status).to.equal(409);
            expect(resposta.body.status).to.equal('error');
            expect(resposta.body.message).to.equal('E-mail já cadastrado.');
        });

        it('deve retornar 422 quando a senha tiver menos de seis caracteres', async () => {
            const resposta = await request(process.env.BASE_URL)
                .post('/auth/register')
                .set('Content-Type', 'application/json')
                .send(postRegistroUsuario.cadastroSenhaInvalida);

            expect(resposta.status).to.equal(422);
            expect(resposta.body.status).to.equal('error');
            expect(resposta.body.message).to.equal('A senha deve ter no mínimo 6 caracteres.');
        });
    });
});
