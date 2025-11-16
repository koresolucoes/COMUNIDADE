// This is a Vercel serverless function for the Node.js runtime
import https from 'node:https';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default (req: VercelRequest, res: VercelResponse) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const domain = url.searchParams.get('domain');

  const writeError = (statusCode: number, message: string) => {
    res.status(statusCode).setHeader('Content-Type', 'application/json').end(JSON.stringify({ error: message }));
  };

  const writeSuccess = (data: any) => {
    res.status(200).setHeader('Content-Type', 'application/json').end(JSON.stringify(data));
  };

  if (!domain || typeof domain !== 'string') {
    return writeError(400, 'Parâmetro "domain" é obrigatório.');
  }

  return new Promise<void>((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      method: 'GET',
      servername: domain, // Crucial for SNI
      rejectUnauthorized: false, // We want the cert even if it's invalid
    };

    const request = https.request(options, (response) => {
      // The socket is a TLSSocket
      const cert = (response.socket as any).getPeerCertificate(true);
      response.socket.end(); // We have the cert, no need to continue the request

      if (!cert || Object.keys(cert).length === 0) {
        writeError(404, `Nenhum certificado SSL encontrado para ${domain}. O site pode não usar HTTPS ou o servidor não está respondendo na porta 443.`);
        return resolve();
      }
      
      const formatIssuer = (issuer: any): string => {
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

      writeSuccess(responseData);
      resolve();
    });

    request.on('error', (err: any) => {
      let message = 'Falha ao conectar ao host. Verifique o nome do domínio.';
      if (err.code === 'ENOTFOUND') {
          message = `Domínio "${domain}" não encontrado. Verifique se digitou corretamente.`;
      } else if (err.code === 'ECONNREFUSED') {
          message = `A conexão foi recusada. O servidor pode estar offline ou a porta 443 está fechada.`;
      } else if (err.code === 'ETIMEDOUT') {
          message = 'A conexão expirou. O servidor demorou muito para responder.';
      } else if (err.message?.includes('certificate has expired')) {
          message = 'O certificado do domínio expirou.';
      }
      request.destroy();
      writeError(500, message);
      resolve();
    });
    
    request.setTimeout(8000, () => {
        request.destroy();
        writeError(504, 'A conexão expirou (timeout). O servidor pode estar offline ou bloqueando conexões.');
        resolve();
    });

    request.end(); // Send the request
  });
};
