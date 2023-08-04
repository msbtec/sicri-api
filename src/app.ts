import 'express-async-errors';
import 'dotenv/config';

import 'reflect-metadata';

import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
// @ts-ignore
import oracledb from 'oracledb';
import os from 'os';
import path from 'path';

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: '*',
  })
);

app.use(helmet());

app.get('/query', async (req: Request, res: Response) => {
  try {
    const { text, api_key } = req.query;

    if (process.env.API_KEY !== api_key) {
      return res.status(401).send('unauthorized');
    }

    const querySearch = String(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (os.platform() === 'win32') {
      oracledb.initOracleClient({
        libDir: path.resolve(__dirname, 'instantclient_21_10'),
      });
    }

    const connection = await oracledb.getConnection({
      user: process.env.ORACLE_SICRI_USER,
      password: process.env.ORACLE_SICRI_PASSWORD,
      connectString: `(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = ${process.env.ORACLE_SICRI_HOST})(PORT = ${process.env.ORACLE_SICRI_PORT}))(CONNECT_DATA =(SID= ${process.env.ORACLE_SICRI_SID})))`,
    });

    const result = await connection.execute(
      `
      SELECT

      individuo.nuregcri, individuo.outocorr, individuo.cpfident, individuo.cidnasci,
      individuo.dtidenti, individuo.dtnascim, individuo.estcivil, individuo.grauinst,
      individuo.nomemae, individuo.nomepai, individuo.nomindic,
      individuo.numdocum, individuo.numfilho, individuo.orgaoexp,
      individuo.paisnasc, individuo.profiind, individuo.tipodocu,
      individuo.ufexpedi, individuo.ufnascim, individuo.sexoindi, individuo.nacioind,
      individuo.cpf, individuo.titulo, individuo.zona, individuo.secao,
      individuo.uftitulo, individuo.codmunicipio, individuo.tpidentif, individuo.tipodoc,

      carac.cutis, carac.barba, carac.bigode, carac.boca, carac.cabelcor, carac.cabeltip,
      carac.compleic, carac.denarsup, carac.labios, carac.nariztam, carac.nariztip,
      carac.olhoscor, carac.olhostip, carac.orelhtam, carac.orelhtip, carac.pescotam,
      carac.pescotip, carac.rosto, carac.sombrfor, carac.sombrtip, carac.testafor, carac.testatip,
      carac.tracos, carac.altura,

      peculi.despecul,

      tatuagem.destatua,

      deform.desdefor,

      cicatriz.descicat,

      alcunha.desalcun,

      amput.descamputacao,

      classidedo.clasprim, classidedo.codidedo, classidedo.codimao, classidedo.qtdclass,

      enderesi.*,

      infracao.infracao, infracao.narcotrafico,

      delito.dtdelito, delito.diasefim, delito.diaseini, delito.hordelit, delito.natuacao, delito.natuinfr, delito.observac, delito.placavei, delito.checkdata,

      meioemp.desmeemp,

      vitima.nomvitim,

      causapres.descausa,

      inquerito.*, delegacia.*,

      endedeli.*,localocor.*,

      decijudi.autjudic, decijudi.dtfimcum, decijudi.dtinicum, decijudi.dtoficbi, decijudi.decjudic,
      decijudi.idconden, decijudi.nuoficbi, decijudi.penaplic, decijudi.regaplic, decijudi.situpena,
      decijudi.tipopena, decijudi.orgaoexp, decijudi.datcade, decijudi.numproce, decijudi.anoproce,
      decijudi.dt_trjulgado, decijudi.dt_sentenca, decijudi.numdoc, decijudi.dt_doc, decijudi.codvara

      FROM SICRI.individuo

      LEFT JOIN SICRI.carac ON individuo.nuregcri = carac.nuregcri and individuo.outocorr = carac.outocorr

      LEFT JOIN (SICRI.peculicarac JOIN SICRI.peculi ON peculicarac.codpecul = peculi.codpecul) ON individuo.nuregcri = peculicarac.nuregcri and individuo.outocorr = peculicarac.outocorr

      LEFT JOIN (SICRI.tatuacarac JOIN SICRI.tatuagem ON tatuacarac.codtatua = tatuagem.codtatua) ON individuo.nuregcri = tatuacarac.nuregcri and individuo.outocorr = tatuacarac.outocorr

      LEFT JOIN (SICRI.deformcarac JOIN SICRI.deform ON deformcarac.coddefor = deform.coddefor) ON individuo.nuregcri = deformcarac.nuregcri and individuo.outocorr = deformcarac.outocorr

      LEFT JOIN (SICRI.cicatcarac JOIN SICRI.cicatriz ON cicatcarac.codcicat = cicatriz.codcicat) ON individuo.nuregcri = cicatcarac.nuregcri and individuo.outocorr = cicatcarac.outocorr

      LEFT JOIN SICRI.alcunha ON individuo.nuregcri = alcunha.nuregcri and individuo.outocorr = alcunha.outocorr

      LEFT JOIN (SICRI.amputcarac JOIN SICRI.amput ON amputcarac.codamputacao = amput.codamputacao) ON individuo.nuregcri = amputcarac.nuregcri and individuo.outocorr = amputcarac.outocorr

      LEFT JOIN SICRI.classidedo ON individuo.nuregcri = classidedo.nuregcri and individuo.outocorr = classidedo.outocorr

      LEFT JOIN SICRI.enderesi ON individuo.nuregcri = enderesi.nuregcri and individuo.outocorr = enderesi.outocorr

      LEFT JOIN SICRI.infracao ON individuo.nuregcri = infracao.numregcri and individuo.outocorr = infracao.outocorr

      LEFT JOIN SICRI.delito ON individuo.nuregcri = delito.nuregcri and individuo.outocorr = delito.outocorr

      LEFT JOIN (SICRI.meioempindi JOIN SICRI.meioemp ON meioempindi.codmeemp = meioemp.codmeemp) ON individuo.nuregcri = meioempindi.nuregcri and individuo.outocorr = meioempindi.outocorr

      LEFT JOIN SICRI.vitima ON individuo.nuregcri = vitima.nuregcri and individuo.outocorr = vitima.outocorr

      LEFT JOIN (SICRI.causapresindi JOIN SICRI.causapres ON causapresindi.codcausa = causapres.codcausa) ON individuo.nuregcri = causapresindi.nuregcri and individuo.outocorr = causapresindi.outocorr

      LEFT JOIN (SICRI.inquerito JOIN SICRI.delegacia ON inquerito.coddeleg = delegacia.coddeleg) ON individuo.nuregcri = inquerito.nuregcri and individuo.outocorr = inquerito.outocorr

      LEFT JOIN (SICRI.endedeli JOIN SICRI.localocor ON endedeli.codlocal = localocor.codlocalocor) ON individuo.nuregcri = endedeli.nuregcri and individuo.outocorr = endedeli.outocorr

      LEFT JOIN SICRI.decijudi ON individuo.nuregcri = decijudi.nuregcri and individuo.outocorr = decijudi.outocorr

      WHERE

      UPPER(individuo.nomindic) LIKE UPPER('%${querySearch}%')
      OR UPPER(individuo.nomemae) LIKE UPPER('%${querySearch}%')
      OR UPPER(individuo.nomepai) LIKE UPPER('%${querySearch}%')
      OR UPPER(individuo.numdocum) LIKE UPPER('%${querySearch}%')
      OR UPPER(individuo.cpf) LIKE UPPER('%${querySearch}%')
      ORDER BY individuo.nomindic
      `
    );
    await connection.close();

    return res.json({
      data: result.rows.map((item: any) => {
        let aux = {
          individuo: {},
          caracteristicas: {},
          peculiariedades: {},
          endereco_residencial: {},
          infracao: {},
          delito: {},
          arma: {},
          vitima: {},
          causa: {},
          inquerito: {},
          auto_judicial: {},
        };

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < item.length; i++) {
          if (i + 1 >= 1 && i + 1 <= 29) {
            // @ts-ignore
            aux = {
              ...aux,
              individuo: {
                ...aux.individuo,
                [result.metaData[i].name]: item[i],
              },
            };
          }
          if (i + 1 >= 30 && i + 1 <= 53) {
            // @ts-ignore
            aux = {
              ...aux,
              caracteristicas: {
                ...aux.caracteristicas,
                [result.metaData[i].name]: item[i],
              },
            };
          }
          if (i + 1 >= 54 && i + 1 <= 63) {
            // @ts-ignore
            aux = {
              ...aux,
              peculiariedades: {
                ...aux.peculiariedades,
                [result.metaData[i].name]: item[i],
              },
            };
          }
          if (i + 1 >= 64 && i + 1 <= 99) {
            // @ts-ignore
            aux = {
              ...aux,
              endereco_residencial: {
                ...aux.endereco_residencial,
                [result.metaData[i].name]: item[i],
              },
            };
          }
          if (i + 1 >= 100 && i + 1 <= 101) {
            // @ts-ignore
            aux = {
              ...aux,
              infracao: {
                ...aux.infracao,
                [result.metaData[i].name]: item[i],
              },
            };
          }
          if (i + 1 >= 102 && i + 1 <= 110) {
            // @ts-ignore
            aux = {
              ...aux,
              delito: {
                ...aux.delito,
                [result.metaData[i].name]: item[i],
              },
            };
          }
          if (i + 1 === 111) {
            // @ts-ignore
            aux = {
              ...aux,
              arma: {
                ...aux.arma,
                [result.metaData[i].name]: item[i],
              },
            };
          }
          if (i + 1 === 112) {
            // @ts-ignore
            aux = {
              ...aux,
              vitima: {
                ...aux.vitima,
                [result.metaData[i].name]: item[i],
              },
            };
          }
          if (i + 1 === 113) {
            // @ts-ignore
            aux = {
              ...aux,
              causa: {
                ...aux.causa,
                [result.metaData[i].name]: item[i],
              },
            };
          }
          if (i + 1 >= 114 && i + 1 <= 176) {
            // @ts-ignore
            aux = {
              ...aux,
              inquerito: {
                ...aux.inquerito,
                [result.metaData[i].name]: item[i],
              },
            };
          }
          if (i + 1 >= 177 && i + 1 <= 196) {
            // @ts-ignore
            aux = {
              ...aux,
              auto_judicial: {
                ...aux.auto_judicial,
                [result.metaData[i].name]: item[i],
              },
            };
          }
        }

        return aux;
      }),
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

export default app;
