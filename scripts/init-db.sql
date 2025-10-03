-- ===============================================
-- 📊 SCRIPT DE INICIALIZAÇÃO DO BANCO
-- ===============================================
-- Configurações iniciais para PostgreSQL

-- Configurar encoding
SET client_encoding = 'UTF8';

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Log de inicialização
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados Barbershop inicializado com sucesso!';
    RAISE NOTICE 'Timezone: %', current_setting('timezone');
    RAISE NOTICE 'Encoding: %', current_setting('client_encoding');
END $$;