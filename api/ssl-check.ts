// This is a Vercel serverless function for the Node.js runtime
import tls from 'node:tls';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  const { domain } = req.query;

  const writeError = (statusCode: number, message: string) => {
    res.status(statusCode).json({ error: message });
  };

  if (!domain || typeof domain !== 'string') {
    return writeError(400, 'Parâmetro "domain" é obrigatório.');
  }

  const options = {
    host: domain,
    port: 443,
    servername: domain, // Crucial for SNI
    rejectUnauthorized: false, // We want the cert even if it's invalid
  };

  try {
    const socket = tls.connect(options, () => {
      if (!socket.authorized) {
        // Even if not authorized (self-signed, etc.), we can still get the cert
        if (socket.authorizationError) {
          console.warn(`SSL Authorization Error for ${domain}: ${socket.authorizationError}`);
        }
      }

      const cert = socket.getPeerCertificate(true);
      socket.end();

      if (!cert || Object.keys(cert).length === 0) {
        return writeError(404, `Nenhum certificado SSL encontrado para ${domain}. O site pode não usar HTTPS.`);
      }
      
      const formatIssuer = (issuer: any) => {
          if (!issuer) return '';
          return Object.entries(issuer)
              .map(([key, value]) => `${key}=${value}`)
              .join(', ');
      };
      
      const issuerChain = (issuerCert: any): any[] => {
          const chain = [];
          let current = issuerCert;
          while (current && current.issuerCertificate) {
              chain.push({
                  subject: formatIssuer(current.subject),
                  issuer: formatIssuer(current.issuer),
                  fingerprint: current.fingerprint
              });
              current = current.issuerCertificate;
          }
          if (current) { // Add the root
             chain.push({
                  subject: formatIssuer(current.subject),
                  issuer: formatIssuer(current.issuer),
                  fingerprint: current.fingerprint
              });
          }
          return chain;
      };

      const responseData = {
        subject: cert.subject,
        issuer: cert.issuer,
        valid_from: cert.valid_from,
        valid_to: cert.valid_to,
        serialNumber: cert.serialNumber,
        fingerprint: cert.fingerprint,
        fingerprint256: cert.fingerprint256,
        subjectaltname: cert.subjectaltname,
        issuerChain: issuerChain(cert.issuerCertificate)
      };

      res.status(200).json(responseData);
    });

    socket.on('error', (err: any) => {
      let message = 'Falha ao conectar ao host. Verifique o nome do domínio.';
      if (err.message.includes('ENOTFOUND')) {
          message = `Domínio "${domain}" não encontrado.`;
      } else if (err.message.includes('ECONNREFUSED')) {
          message = `A conexão foi recusada. A porta 443 pode estar fechada.`
      }
      return writeError(500, message);
    });
    
    // Set a timeout to prevent the function from hanging
    socket.setTimeout(5000, () => {
        socket.destroy();
        writeError(504, 'A conexão expirou. O servidor pode estar offline ou bloqueando conexões.');
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido no servidor.';
    return writeError(500, message);
  }
};
