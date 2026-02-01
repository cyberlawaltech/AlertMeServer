# Client Registry System Architecture

## Executive Summary

This document outlines the comprehensive architecture for implementing a **Client Registry System** using a serverless approach with **Supabase** as the backend. The system serves as the authoritative source for all client information across the organization, providing scalable, secure, and highly available client lifecycle management.

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```mermaid
graph TBMockSupabase>;
  
  beforeEach(() => {
    mockSupabase = createMockSupabase();
    service = new ClientService(mockSupabase);
  });
  
  describe('createClient',
    subgraph Client Applications
        WebApp[Web Dashboard]
        MobileApp[Mobile Apps]
        ExternalSys () => {
    it('should create a client with valid data', async () => {
      const clientData = {
        firstName: 'John',
        lastName: 'Do[External Systems]
    end
    
    subgraph Next.js Application
        API[API Routes]
        Auth[Authentication]
        Cache[Redis Cache]
        LB[Load Balancer]
    end
    
    subgraph Supabase Platform
        PG[(PostgreSQL Database)]
        Realtime[e',
        email: 'john@example.com',
        clientType: 'individual' as const,
      };
      
      mockSupabase.from('clients').insert.mockResolvedValue({
        dataReal-time Subscriptions]
        Storage[Storage Bucket]
        Edge[Edge Functions]
    end
    
    subgraph External Services
        CRM[CRM Systems]
       : { id: 'uuid', ...clientData, client_number: 'CL-ABC123' },
        error: null,
      });
      
      const result = await Marketing[Marketing Automation]
        Billing[Billing Systems]
        Partners[Partner APIs]
    end
    
    WebApp --> LB
    MobileApp --> LB
 service.createClient(clientData, 'user-uuid');
      
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
         ExternalSys --> API
    LB --> API
    API --> Auth
    Auth --> PG
    API --> Cache
    API --> Edge
    expect(result.clientNumber).toMatch(/^CL-/);
    });
    
    it('should throw error for invalid email', async () => {
      const clientData = {
        Edge --> Realtime
    Realtime --> WebApp
    API --> CRM
    API --> Marketing
    API --> Billing
    API --> Partners
```

### 1.2 firstName: 'John',
        lastName: 'Doe',
        emails: [{ email: 'invalid-email' }],
      };
      
      await expect(service.createClient(clientData, 'user- Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS | Responsiveuuid')).rejects.toThrow();
    });
    
    it('should generate unique client number', async () => {
      const clientData = {
        firstName: 'Jane',
 dashboard UI |
| **Backend** | Supabase (PostgreSQL), Next.js API Routes | Serverless API, database |
| **Real        lastName: 'Smith',
        clientType: 'individual' as const,
      };
      
      mockSupabase.from('clients').insert.mockResolvedValue({
        data: { id: '-time** | Supabase Realtime | Live data synchronization |
| **Caching** | Upstash Redis | Session & query caching |
|uuid', ...clientData, client_number: 'CL-DEF456' },
        error: null,
      });
      
      const result = await service.createClient(clientData, 'user-uuid');
      
      expect(result.clientNumber).toBeDefined();
      expect(typeof result.clientNumber).toBe('string');
    });
  });
  
  describe('updateClient', () => {
 **Authentication** | Supabase Auth | OAuth, JWT, RLS policies |
| **Storage** | Supabase Storage | Document attachments |
| **Validation** | Zod    it('should update client with valid data', async () => {
      const existingClient = {
        id: 'uuid',
        firstName: 'John | Schema validation |
| **Testing** | Jest, React Testing Library | Unit & integration tests |

## 2. Database Schema Design

### 2.1 Core Tables',
        lastName: 'Doe',
        status: 'active' as const,
      };
      
      mockSupabase.from('clients').select.mockResolvedValue({
        data: [

```sql
-- clients: Central client registry table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clientexistingClient],
        error: null,
      });
      
      mockSupabase.from('clients').update.mockResolvedValue({
        data: { ...existingClient, firstName: 'Johnny' },
       _code VARCHAR(50) UNIQUE NOT NULL,
    legacy_id VARCHAR(100),
    external_ref VARCHAR(255),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE error: null,
      });
      
      const result = await service.updateClient(
        'uuid',
        { firstName: 'Johnny' },
        'user-uuid'
      );
      
      expect(result.firstName).toBe('Johnny');
    });
    
    it('should audit log changes', async () => {
      const existingClient = {
        id: 'uuid,
    gender VARCHAR(20),
    ssn_encrypted TEXT, -- Field-level encryption
    national_id VARCHAR(50),
    
    -- Classification
    client',
        firstName: 'John',
        lastName: 'Doe',
      };
      
      mockSupabase.from('clients').select.mockResolvedValue({
        data: [existingClient],
       _type VARCHAR(50) DEFAULT 'individual', -- individual, business, organization
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, pending error: null,
      });
      
      mockSupabase.from('clients').update.mockResolvedValue({
        data: { ...existingClient, firstName: 'Johnny' },
        error: null,
, merged
    classification VARCHAR(100),
    segment VARCHAR(50),
    risk_level VARCHAR(20),
    
    -- Metadata
    data_source VARCHAR(100),
      });
      
      await service.updateClient(
        'uuid',
        { firstName: 'Johnny' },
        'user-uuid',
        'Name correction'
      );
      
      expect    quality_score DECIMAL(3,2) DEFAULT 1.00,
    preferred_language VARCHAR(10) DEFAULT 'en',
    preferred_communication VARCHAR(50)(mockSupabase.from('audit_logs').insert).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'client.updated',
          reason: 'Name correction',
 DEFAULT 'email',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth        })
      );
    });
  });
  
  describe('deleteClient', () => {
    it('should soft delete client', async () => {
      mockSupabase.from('clients').update.mock.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_byResolvedValue({
        data: { id: 'uuid', status: 'inactive' },
        error: null,
      });
      
      await service.deleteClient('uuid', 'user-uuid', UUID REFERENCES auth.users(id)
);

-- client_identifiers: Multiple identifier types
CREATE TABLE client_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random 'At user request');
      
      expect(mockSupabase.from('clients').update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'inactive',
_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    identifier_type VARCHAR(50) NOT NULL, -- passport, driver_license, tax_id, etc          deleted_at: expect.any(String),
          deleted_by: 'user-uuid',
        })
      );
    });
  });
});
```

### 10.2 Integration Tests

```typescript
// __.
    identifier_value TEXT NOT NULL,
    issuing_country VARCHAR(3),
    issuing_authority VARCHAR(100),
    valid_from DATE,
    valid_untiltests__/api/clients.test.ts

import { createClient } from '@supabase/supabase-js';
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/clients/route';

describe('/api/clients', () => {
  let supabase: ReturnType<typeof create DATE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, identifier_type, identifier_value)
);

-- addresses: Multiple address records per client
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    addressClient>;
  
  beforeAll(() => {
    supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  });
  
  describe_type VARCHAR(50) NOT NULL, -- residential, business, mailing, billing
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255('POST', () => {
    it('should create a new client', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          firstName: 'Test',
          lastName: 'User',
          emails: [{ email: 'test@example.com' }],
        },
       ),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(3) NOT NULL,
    
    -- Geolocation
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    geocode_accuracy VARCHAR(50),
    
    -- Validation
    is_ver headers: {
          authorization: 'Bearer valid-token',
        },
      });
      
      await POST(req, res);
      
      expect(res._getStatusCode()).toBe(ified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verification_source VARCHAR(100),
    
    -- Metadata
    is_primary BOOLEAN DEFAULT FALSE,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- contact_methods: Various201);
      expect(JSON.parse(res._getData())).toMatchObject({
        firstName: 'Test',
        lastName: 'User',
      });
    });
    
    it(' contact channels
CREATE TABLE contact_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOTshould return 400 for invalid data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          firstName: 'Test',
          // Missing required lastName
        },
      });
      
      await POST(req, res);
      
      expect(res._getStatusCode()).toBe(400);
    NULL, -- email, phone, mobile, fax, social
    contact_value TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT });
  });
});
```

## 11. Deployment & Operations

### 11.1 Supabase Setup

```sql
-- Run this in Supabase SQL FALSE,
    verified_at TIMESTAMPTZ,
    verification_source VARCHAR(100),
    opt_in_status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, pending, unsubscribed
    opt_in_date TIMESTAMPTZ,
    preferred BOOLEAN DEFAULT FALSE,
    created_at TIM editor to set up the database

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- RunESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, contact_type, contact_value)
);

-- consent_records table creation scripts from section 2
-- Run RLS policies from section 8.1

-- Create functions for automated duplicate: GDPR consent tracking
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    consent detection
CREATE OR REPLACE FUNCTION check_client_duplicates(client_id UUID)
RETURNS void AS $$
BEGIN
  -- Call duplicate detection logic
  PER_type VARCHAR(100) NOT NULL, -- marketing, data_processing, third_party, etc.
    consent_given BOOLEAN NOT NULL,
    consent_version VARCHAR(20FORM detect_duplicates_for_client(client_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic duplicate checking
CREATE TRIGGER on),
    consent_date TIMESTAMPTZ DEFAULT NOW(),
    consent_withdrawal_date TIMESTAMPTZ,
    source VARCHAR(100), -- web, mobile_client_created
  AFTER INSERT ON clients
  FOR EACH ROW EXECUTE FUNCTION check_client_duplicates(NEW.id);
```

### 11.2 Environment Configuration, phone, in_person
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

###

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 2.2 Relationship Tables

```sql
-- client_relationships: Track connections between entities
CREATE TABLE client_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuidSUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Encryption
FIELD_ENCRYPTION_KEY=your-32-byte-hex-key

# External Systems(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    related_client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- household (for sync)
CRM_API_URL=https://api.crm.example.com
CRM_API_KEY=your-crm-api-key
MARKETING_API_URL_member, business_owner, guardian, etc.
    relationship_strength DECIMAL(3,2) DEFAULT 1.00,
=https://api.marketing.example.com
MARKETING_API_KEY=your-marketing-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

    is_active BOOLEAN DEFAULT TRUE,
    effective_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
   ## 12. Monitoring & Observability

### 12.1 Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
 UNIQUE(client_id, related_client_id, relationship_type)
);

-- households: Group clients into households
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
| API Response Time (p95) | < 200ms | > 500ms |
| Sync Success Rate | > 99% | < 95% |
| Duplicate    household_code VARCHAR(50) UNIQUE NOT NULL,
    household_type VARCHAR(50) DEFAULT 'family',
    primary_client_id UUID REFERENCES clients(id),
    address Detection Accuracy | > 90% | < 80% |
| Data Quality Score (avg) | > 0.9 | _id UUID REFERENCES addresses(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- businesses: Business/organization clients
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   < 0.7 |
| Sync Latency | < 5min | > 15min |

### 12.2 Alert Rules

```yaml
# alerts.yml
al client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    business_type VARCHAR(100),
    industry VARCHAR(100),
    registration_number VARCHAR(50),
    tax_id VARCHAR(50),
    founding_date DATE,
    employee_count VARCHAR(50),
    annual_revenue DECerts:
  - name: High Error Rate
    condition: error_rate > 5% for 5 minutes
    severity: warning
    notification:IMAL(15,2),
    website_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
 slack #engineering
  
  - name: Sync Failure
    condition: sync_job_status == 'failed'
    severity: critical
    notification);
```

### 2.3 Audit and Synchronization Tables

```sql
-- audit_logs: Comprehensive audit trail
CREATE TABLE audit_logs (
: pagerduty
  
  - name: High Duplicate Queue
    condition: pending_duplicates > 100
    severity: warning
    notification: slack #data-quality
  
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_fields JSONB,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255  - name: API Latency
    condition: p95_latency > 500ms for 10 minutes
    severity: warning
    notification: slack #performance
),
    user_role VARCHAR(100),
    source_application VARCHAR(100),
    source_ip INET,
    user_agent TEXT,
    change_reason TEXT,
    transaction```

## 13. Success Criteria

1. **Functional Requirements**
   - [ ] Complete CRUD operations for all client data
   - [ ] Real-time data synchronization with connected systems
   - [ ] Automated duplicate detection with configurable thresholds
   - [ ] Comprehensive audit logging_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- duplicate_candidates: Potential duplicate detection
CREATE TABLE duplicate_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id_1 UUID REFERENCES clients(id) ON DELETE CASCADE,
    client_id_2 UUID REFERENCES clients(id) ON DELETE CASCADE,
   
   - [ ] Role-based access control

2. **Non-Functional Requirements**
   - [ ] 90%+ unit test coverage
   - [ ] API response time  match_score DECIMAL(5,4) NOT NULL,
    match_fields JSONB NOT NULL,
    match_type VARCHAR(50) NOT NULL, -- deterministic, probabilistic< 200ms p95
   - [ ] 99.9% availability SLA
   - [ ] GDPR compliance
   - [ ] WCAG 2.1 AA accessibility

3. **Performance Requirements**
   - [ ] Support 1M+ clients
   - [ ] Sub-second client lookups
   - [ ] 
    status VARCHAR(50) DEFAULT 'pending_review', -- pending_review, approved, rejected, merged
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMEST< 5min sync latency
   - [ ] Horizontal scaling capability

## 14. Timeline & Phases

| Phase | Duration |AMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id_1, client_id_2)
);

-- sync Deliverables |
|-------|----------|--------------|
| Phase 1 | 2 weeks | Database schema, basic CRUD API, authentication |
| Phase 2 | 2_connections: Connected systems configuration
CREATE TABLE sync_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_name VARCHAR(100) NOT NULL,
    system_type VARCHAR