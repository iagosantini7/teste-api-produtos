import 'dotenv/config';
import request from 'supertest';
import postLogin from '../fixtures/postLogin.json' with { type: 'json' };

export const obterToken = async (credenciais = postLogin.usuarioValido) => {
    const resposta = await request(process.env.BASE_URL)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send(credenciais);

    return resposta.body.token;
};
