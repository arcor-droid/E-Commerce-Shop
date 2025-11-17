# TODO / Technische Schulden

## Bilder / Static Files - MUSS ÜBERARBEITET WERDEN ⚠️

**Aktueller Stand (temporäre Lösung):**
- Frontend hat hardcoded `http://localhost:8000` für Bild-URLs
- Funktioniert nur in der Entwicklungsumgebung
- Nicht produktionsreif

**Problem:**
```typescript
// In products.component.ts:
return `http://localhost:8000${product.image}`;  // ❌ Hardcoded!
```

**Saubere Lösung (TODO):**
1. **Environment-Konfiguration nutzen:**
   - `environment.ts` mit `apiUrl` Variable
   - Frontend baut URLs dynamisch: `${environment.apiUrl}${product.image}`
   - Unterschiedliche Configs für dev/prod

2. **Alternative: Relative URLs mit Proxy:**
   - Angular Proxy-Config (`proxy.conf.json`)
   - Frontend nutzt relative URLs: `/api/static/...`
   - Proxy leitet an Backend weiter

3. **Alternative: CDN/Cloud Storage:**
   - Bilder auf S3, Cloudinary, etc.
   - Absolute URLs in Datenbank
   - Backend unabhängig von Static File Serving

**Empfehlung für Produktion:**
- Option 1 (Environment Config) - einfachste Migration
- Option 3 (CDN) - beste Performance und Skalierbarkeit

**Zeitpunkt:**
- Vor Production Deployment überarbeiten
- Bei Docker Compose Production-Setup berücksichtigen

---

## Weitere TODOs

### Bilder Upload
- [ ] Admin kann eigene Bilder hochladen
- [ ] File Upload Endpoint im Backend
- [ ] Image Validation (Größe, Format)
- [ ] Optional: Image Resizing/Optimization

### Testing
- [ ] Unit Tests für Services
- [ ] E2E Tests für kritische User Flows
- [ ] API Integration Tests

### Security
- [ ] CORS richtig für Production konfigurieren
- [ ] Rate Limiting
- [ ] Input Validation überprüfen

### Performance
- [ ] Lazy Loading für Bilder
- [ ] Pagination für Produktliste
- [ ] Caching Strategy

