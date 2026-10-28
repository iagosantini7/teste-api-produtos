import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { expect } from 'chai';
import { obterToken } from '../helpers/autenticacao.js';
import postLogin from '../fixtures/postLogin.json' with {type: 'json'};
import postProdutos from '../fixtures/postProdutos.json' with {type: 'json'};

describe('Produto', () => {
    const criarProduto = async (token, dados = {}) => {
        const payload = {
            ...postProdutos.produtoValido,
            codigo: `PROD-${randomUUID()}`,
            ...dados
        };
        const resposta = await request(process.env.BASE_URL)
            .post('/produtos')
            .set('Authorization', `Bearer ${token}`)
            .send(payload);
        expect(resposta.status).to.equal(201);
        return resposta.body.data;
    };

    const excluirProduto = async (token, id) => {
        if (id) {
            await request(process.env.BASE_URL)
                .delete(`/produtos/${id}`)
                .set('Authorization', `Bearer ${token}`);
        }
    };

    describe('sem usuário autenticado', () => {
        it('deve retornar 401 ao listar produtos sem token', async () => {
            const resposta = await request(process.env.BASE_URL).get('/produtos');
            expect(resposta.status).to.equal(401);
        });

        it('deve retornar 401 ao buscar produto sem token', async () => {
            const resposta = await request(process.env.BASE_URL).get('/produtos/1');
            expect(resposta.status).to.equal(401);
        });

        it('deve retornar 401 ao cadastrar produto sem token', async () => {
            const resposta = await request(process.env.BASE_URL).post('/produtos').send(postProdutos.produtoValido);
            expect(resposta.status).to.equal(401);
        });

        it('deve retornar 401 ao atualizar produto sem token', async () => {
            const resposta = await request(process.env.BASE_URL).put('/produtos/1').send(postProdutos.produtoValido);
            expect(resposta.status).to.equal(401);
        });

        it('deve retornar 401 ao excluir produto sem token', async () => {
            const resposta = await request(process.env.BASE_URL).delete('/produtos/1');
            expect(resposta.status).to.equal(401);
        });
    });

    describe('com usuário autenticado', () => {
        let token;

        before(async () => {
            token = await obterToken(postLogin.usuarioValido);
        });

    describe('GET /produtos', () => {
        it('deve retornar 200 ao listar produtos com paginação e filtro', async () => {
            const codigo = `PROD-${randomUUID()}`;
            let produto;
            try {
                produto = await criarProduto(token, { codigo, nome: `Busca ${codigo}` });
                const resposta = await request(process.env.BASE_URL)
                    .get('/produtos')
                    .query({ page: 1, limit: 10, busca: codigo })
                    .set('Authorization', `Bearer ${token}`);

                expect(resposta.status).to.equal(200);
                expect(resposta.body.status).to.equal('success');
                expect(resposta.body.data).to.be.an('array');
                const produtoListado = resposta.body.data.find((item) => item.id === produto.id);
                expect(produtoListado).to.include({ id: produto.id, codigo });
                expect(resposta.body.pagination).to.include({ page: 1, limit: 10 });
            } finally {
                await excluirProduto(token, produto?.id);
            }
        });
    });

    describe('GET /produtos/:id', () => {
        it('deve retornar 200 ao buscar um produto existente', async () => {
            let produto;
            try {
                produto = await criarProduto(token);
                const resposta = await request(process.env.BASE_URL)
                    .get(`/produtos/${produto.id}`)
                    .set('Authorization', `Bearer ${token}`);

                expect(resposta.status).to.equal(200);
                expect(resposta.body.status).to.equal('success');
                expect(resposta.body.data).to.include({ id: produto.id, codigo: produto.codigo });
            } finally {
                await excluirProduto(token, produto?.id);
            }
        });

        it('deve retornar 404 para um produto inexistente', async () => {
            const resposta = await request(process.env.BASE_URL)
                .get('/produtos/2147483647')
                .set('Authorization', `Bearer ${token}`);
            expect(resposta.status).to.equal(404);
        });
    });

    describe('POST /produtos', () => {
            it('deve retornar 201 ao cadastrar um produto válido', async () => {
                const produtos = {
                    ...postProdutos.produtoValido,
                    codigo: `PROD-${randomUUID()}`
                };
                let id;
                try {
                    const resposta = await request(process.env.BASE_URL)
                        .post('/produtos')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', `Bearer ${token}`)
                        .send(produtos);

                    expect(resposta.status).to.equal(201);
                    expect(resposta.body.message).to.equal('Produto criado com sucesso');
                    id = resposta.body.data.id;
                } finally {
                    await excluirProduto(token, id);
                }
            });

            it('deve retornar 422 quando o código do produto não for informado', async () => {
                const resposta = await request(process.env.BASE_URL)
                    .post('/produtos')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `Bearer ${token}`)
                    .send(postProdutos.produtoInvalido);

                expect(resposta.status).to.equal(422);
                expect(resposta.body.status).to.equal('error');
                expect(resposta.body.message).to.equal('Dados inválidos');
                expect(resposta.body.errors).to.deep.include({
                    campo: 'codigo',
                    mensagem: 'Código do produto é obrigatório'
                });
            });

            it('deve retornar 409 quando o código do produto já estiver cadastrado', async () => {
                let produto;
                try {
                    produto = await criarProduto(token);
                    const resposta = await request(process.env.BASE_URL)
                        .post('/produtos')
                        .set('Authorization', `Bearer ${token}`)
                        .send({ ...postProdutos.produtoValido, codigo: produto.codigo });

                    expect(resposta.status).to.equal(409);
                    expect(resposta.body.status).to.equal('error');
                } finally {
                    await excluirProduto(token, produto?.id);
                }
            });
    });

    describe('PUT /produtos/:id', () => {
            it('deve retornar 200 ao atualizar um produto existente', async () => {
                let produto;
                try {
                    produto = await criarProduto(token);
                    const atualizacao = {
                        ...postProdutos.produtoValido,
                        codigo: produto.codigo,
                        nome: `Atualizado ${produto.nome}`
                    };
                    const resposta = await request(process.env.BASE_URL)
                        .put(`/produtos/${produto.id}`)
                        .set('Authorization', `Bearer ${token}`)
                        .send(atualizacao);

                    expect(resposta.status).to.equal(200);
                    expect(resposta.body.message).to.equal('Produto atualizado com sucesso');
                    expect(resposta.body.data.nome).to.equal(atualizacao.nome);
                } finally {
                    await excluirProduto(token, produto?.id);
                }
            });

            it('deve retornar 404 ao atualizar um produto inexistente', async () => {
                const resposta = await request(process.env.BASE_URL)
                    .put('/produtos/2147483647')
                    .set('Authorization', `Bearer ${token}`)
                    .send(postProdutos.produtoValido);
                expect(resposta.status).to.equal(404);
            });
    });

    describe('DELETE /produtos/:id', () => {
            it('deve retornar 200 ao excluir um produto existente e 404 ao buscá-lo', async () => {
                const produto = await criarProduto(token);
                const resposta = await request(process.env.BASE_URL)
                    .delete(`/produtos/${produto.id}`)
                    .set('Authorization', `Bearer ${token}`);

                expect(resposta.status).to.equal(200);
                expect(resposta.body.message).to.equal('Produto deletado com sucesso');

                const busca = await request(process.env.BASE_URL)
                    .get(`/produtos/${produto.id}`)
                    .set('Authorization', `Bearer ${token}`);
                expect(busca.status).to.equal(404);
            });

            it('deve retornar 404 ao excluir um produto inexistente', async () => {
                const resposta = await request(process.env.BASE_URL)
                    .delete('/produtos/2147483647')
                    .set('Authorization', `Bearer ${token}`);
                expect(resposta.status).to.equal(404);
            });
    });
    });
});
