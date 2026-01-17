# 🔗 URLs da API - NovaEdu BNCC

## 🌐 Domínio

**Site**: https://www.novaedubncc.com.br/

## 📍 Estrutura

- **Frontend**: `https://www.novaedubncc.com.br/novaedu/`
- **API**: `https://www.novaedubncc.com.br/api/` (movida para fora do frontend)

## 📍 Endpoints da API

### Autenticação

#### Login
- **URL**: `https://www.novaedubncc.com.br/api/auth/login`
- **Método**: POST
- **Body**:
```json
{
  "email": "marcus.lopes",
  "password": "?&,6bsMrD08a"
}
```

#### Logout
- **URL**: `https://www.novaedubncc.com.br/api/auth/logout`
- **Método**: POST

#### Obter Usuário Atual
- **URL**: `https://www.novaedubncc.com.br/api/auth/me`
- **Método**: GET

### Usuários

#### Listar Usuários
- **URL**: `https://www.novaedubncc.com.br/api/users/`
- **Método**: GET
- **Requer**: Admin ou Root

## 🧪 Testar Endpoints

### Via cURL

```bash
# Login
curl -X POST https://www.novaedubncc.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marcus.lopes","password":"?&,6bsMrD08a"}'

# Obter usuário atual (após login)
curl -X GET https://www.novaedubncc.com.br/api/auth/me \
  -H "Cookie: PHPSESSID=SEU_SESSION_ID"
```

### Via Postman

1. **Login**:
   - URL: `https://www.novaedubncc.com.br/api/auth/login`
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "email": "marcus.lopes",
     "password": "?&,6bsMrD08a"
   }
   ```

2. **Copiar o Cookie** da resposta (PHPSESSID)

3. **Usar em outras requisições**:
   - Headers: `Cookie: PHPSESSID=valor_copiado`

## 📁 Estrutura no Servidor

```
/home/supernerd/
├── novaedu/          (Frontend React)
│   ├── index.html
│   └── assets/
└── api/              (API PHP - FORA do frontend)
    ├── config/
    ├── auth/
    └── users/
```

## ✅ Checklist

- [ ] API enviada para `https://www.novaedubncc.com.br/api/`
- [ ] Permissões configuradas (pastas 755, arquivos 644)
- [ ] `database.php` verificado (host correto)
- [ ] Testado login via Postman/curl
- [ ] Verificado resposta JSON

---
