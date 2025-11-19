

import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ToolsIndexComponent } from './components/tools/tools-index/tools-index.component';
import { CronGeneratorComponent } from './components/tools/cron-generator/cron-generator.component';
import { JsonFormatterComponent } from './components/tools/json-formatter/json-formatter.component';
import { PlaceholderComponent } from './components/shared/placeholder/placeholder.component';
import { UrlCodecComponent } from './components/tools/url-codec/url-codec.component';
import { Base64CodecComponent } from './components/tools/base64-codec/base64-codec.component';
import { JwtDecoderComponent } from './components/tools/jwt-decoder/jwt-decoder.component';
import { TimestampConverterComponent } from './components/tools/timestamp-converter/timestamp-converter.component';
import { N8nExpressionSimulatorComponent } from './components/tools/n8n-expression-simulator/n8n-expression-simulator.component';
import { DataConverterComponent } from './components/tools/data-converter/data-converter.component';
import { HashGeneratorComponent } from './components/tools/hash-generator/hash-generator.component';
import { PasswordGeneratorComponent } from './components/tools/password-generator/password-generator.component';
import { UuidGeneratorComponent } from './components/tools/uuid-generator/uuid-generator.component';
import { RegexTesterComponent } from './components/tools/regex-tester/regex-tester.component';
import { MockDataGeneratorComponent } from './components/tools/mock-data-generator/mock-data-generator.component';
import { WebhookTesterComponent } from './components/tools/webhook-tester/webhook-tester.component';
import { MyIpComponent } from './components/tools/my-ip/my-ip.component';
import { RestClientComponent } from './components/tools/rest-client/rest-client.component';
import { DnsCheckerComponent } from './components/tools/dns-checker/dns-checker.component';
import { SslCheckerComponent } from './components/tools/ssl-checker/ssl-checker.component';
import { DiffCheckerComponent } from './components/tools/diff-checker/diff-checker.component';
import { DockerComposeGeneratorComponent } from './components/tools/docker-compose-generator/docker-compose-generator.component';
import { QrCodeGeneratorComponent } from './components/tools/qr-code-generator/qr-code-generator.component';
import { BlogListComponent } from './components/blog/blog-list/blog-list.component';
import { BlogPostComponent } from './components/blog/blog-post/blog-post.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { N8nManagerComponent } from './components/tools/n8n-manager/n8n-manager.component';
import { ForumListComponent } from './components/forum/forum-list/forum-list.component';
import { ForumNewTopicComponent } from './components/forum/forum-new-topic/forum-new-topic.component';
import { ForumTopicComponent } from './components/forum/forum-topic/forum-topic.component';
import { TemplateListComponent } from './components/templates/template-list/template-list.component';
import { TemplateDetailComponent } from './components/templates/template-detail/template-detail.component';
import { BoxShadowGeneratorComponent } from './components/tools/box-shadow-generator/box-shadow-generator.component';
import { CssGradientGeneratorComponent } from './components/tools/css-gradient-generator/css-gradient-generator.component';
import { ClipPathGeneratorComponent } from './components/tools/clip-path-generator/clip-path-generator.component';
import { CssGridBuilderComponent } from './components/tools/css-grid-builder/css-grid-builder.component';
import { CssFilterGeneratorComponent } from './components/tools/css-filter-generator/css-filter-generator.component';
import { CssAnimationGeneratorComponent } from './components/tools/css-animation-generator/css-animation-generator.component';
import { LearningIndexComponent } from './components/learning/learning-index/learning-index.component';
import { LearningPathComponent } from './components/learning/learning-path/learning-path.component';
import { OQueEProgramacaoComponent } from './components/learning/articles/o-que-e-programacao/o-que-e-programacao.component';
import { LogicaDeProgramacaoComponent } from './components/learning/articles/logica-de-programacao/logica-de-programacao.component';
import { TiposDeDadosComponent } from './components/learning/articles/tipos-de-dados/tipos-de-dados.component';
import { IntroducaoPseudocodigoComponent } from './components/learning/articles/introducao-pseudocodigo/introducao-pseudocodigo.component';
import { ComoInternetFuncionaComponent } from './components/learning/articles/como-internet-funciona/como-internet-funciona.component';
import { HttpApisComponent } from './components/learning/articles/http-apis/http-apis.component';
import { EntendendoJsonComponent } from './components/learning/articles/entendendo-json/entendendo-json.component';
import { OQueSaoWebhooksComponent } from './components/learning/articles/o-que-sao-webhooks/o-que-sao-webhooks.component';
import { IdeConsoleComponent } from './components/learning/articles/ide-console/ide-console.component';
import { GitGithubComponent } from './components/learning/articles/git-github/git-github.component';
import { OQueEIdeComponent } from './components/learning/articles/o-que-e-ide/o-que-e-ide.component';
import { GerenciadoresPacotesNpmComponent } from './components/learning/articles/gerenciadores-pacotes-npm/gerenciadores-pacotes-npm.component';
import { IntroducaoDockerComponent } from './components/learning/articles/introducao-docker/introducao-docker.component';
import { VolumesDockerComponent } from './components/learning/articles/volumes-docker/volumes-docker.component';
import { RedesDockerComponent } from './components/learning/articles/redes-docker/redes-docker.component';
import { RegexBasicoComponent } from './components/learning/articles/regex-basico/regex-basico.component';
import { HelloWorldNodejsComponent } from './components/learning/articles/hello-world-nodejs/hello-world-nodejs.component';
import { OQueEBancoDeDadosComponent } from './components/learning/articles/o-que-e-banco-de-dados/o-que-e-banco-de-dados.component';
import { ConectandoAppBancoDadosComponent } from './components/learning/articles/conectando-app-banco-dados/conectando-app-banco-dados.component';
import { ConstruindoApiRestCrudComponent } from './components/learning/articles/construindo-api-rest-crud/construindo-api-rest-crud.component';
import { OQueEJwtComponent } from './components/learning/articles/o-que-e-jwt/o-que-e-jwt.component';
import { DockerizandoAppNodejsComponent } from './components/learning/articles/dockerizando-app-nodejs/dockerizando-app-nodejs.component';
import { OQueEVpsComponent } from './components/learning/articles/o-que-e-vps/o-que-e-vps.component';
import { PublicandoAppVpsComponent } from './components/learning/articles/publicando-app-vps/publicando-app-vps.component';
import { EntendendoExpressoesCronComponent } from './components/learning/articles/entendendo-expressoes-cron/entendendo-expressoes-cron.component';
import { OQueEN8nComponent } from './components/learning/articles/o-que-e-n8n/o-que-e-n8n.component';
import { ConhecendoInterfaceN8nComponent } from './components/learning/articles/conhecendo-interface-n8n/conhecendo-interface-n8n.component';
import { OQueENoN8nComponent } from './components/learning/articles/o-que-e-no-n8n/o-que-e-no-n8n.component';
import { PrimeiroWorkflowN8nComponent } from './components/learning/articles/primeiro-workflow-n8n/primeiro-workflow-n8n.component';
import { N8nDataFlowComponent } from './components/learning/articles/n8n-data-flow/n8n-data-flow.component';
import { N8nSetNodeComponent } from './components/learning/articles/n8n-set-node/n8n-set-node.component';
import { N8nIfNodeComponent } from './components/learning/articles/n8n-if-node/n8n-if-node.component';
import { N8nLoopingComponent } from './components/learning/articles/n8n-looping/n8n-looping.component';
import { N8nHttpRequestComponent } from './components/learning/articles/n8n-http-request/n8n-http-request.component';
import { N8nCredentialsComponent } from './components/learning/articles/n8n-credentials/n8n-credentials.component';
import { N8nMergeNodeComponent } from './components/learning/articles/n8n-merge-node/n8n-merge-node.component';
import { N8nSplitInBatchesComponent } from './components/learning/articles/n8n-split-in-batches/n8n-split-in-batches.component';
import { N8nBinaryDataComponent } from './components/learning/articles/n8n-binary-data/n8n-binary-data.component';
import { N8nCodeNodeComponent } from './components/learning/articles/n8n-code-node/n8n-code-node.component';
import { N8nSubworkflowsComponent } from './components/learning/articles/n8n-subworkflows/n8n-subworkflows.component';
import { N8nErrorHandlingComponent } from './components/learning/articles/n8n-error-handling/n8n-error-handling.component';
import { N8nScalingQueueModeComponent } from './components/learning/articles/n8n-scaling-queue-mode/n8n-scaling-queue-mode.component';
import { N8nSubworkflowsVsCodeComponent } from './components/learning/articles/n8n-subworkflows-vs-code/n8n-subworkflows-vs-code.component';
import { N8nStaticDataComponent } from './components/learning/articles/n8n-static-data/n8n-static-data.component';
import { N8nGitVersioningComponent } from './components/learning/articles/n8n-git-versioning/n8n-git-versioning.component';
import { N8nCicdComponent } from './components/learning/articles/n8n-cicd/n8n-cicd.component';
import { N8nCustomNodesComponent } from './components/learning/articles/n8n-custom-nodes/n8n-custom-nodes.component';

// Python Learning Path Articles
import { PythonIntroAmbienteComponent } from './components/learning/articles/python-intro-ambiente/python-intro-ambiente.component';
import { PythonVariaveisTiposComponent } from './components/learning/articles/python-variaveis-tipos/python-variaveis-tipos.component';
import { PythonListasDicionariosComponent } from './components/learning/articles/python-listas-dicionarios/python-listas-dicionarios.component';
import { PythonFuncoesComponent } from './components/learning/articles/python-funcoes/python-funcoes.component';
import { PythonArquivosComponent } from './components/learning/articles/python-arquivos/python-arquivos.component';
import { PythonRequestsComponent } from './components/learning/articles/python-requests/python-requests.component';
import { PythonWebScrapingComponent } from './components/learning/articles/python-web-scraping/python-web-scraping.component';
import { PandasIntroComponent } from './components/learning/articles/pandas-intro/pandas-intro.component';
import { PandasLeituraEscritaComponent } from './components/learning/articles/pandas-leitura-escrita/pandas-leitura-escrita.component';
import { PandasSelecaoFiltragemComponent } from './components/learning/articles/pandas-selecao-filtragem/pandas-selecao-filtragem.component';
import { PandasLimpezaDadosComponent } from './components/learning/articles/pandas-limpeza-dados/pandas-limpeza-dados.component';
import { PandasAgrupamentoComponent } from './components/learning/articles/pandas-agrupamento/pandas-agrupamento.component';

// Scikit-learn Articles
import { SklearnOQueEMlComponent } from './components/learning/articles/sklearn-o-que-e-ml/sklearn-o-que-e-ml.component';
import { SklearnPrimeiroModeloComponent } from './components/learning/articles/sklearn-primeiro-modelo/sklearn-primeiro-modelo.component';
import { SklearnMetricasComponent } from './components/learning/articles/sklearn-metricas/sklearn-metricas.component';
import { SklearnFeatureEngineeringComponent } from './components/learning/articles/sklearn-feature-engineering/sklearn-feature-engineering.component';
import { SklearnPipelineComponent } from './components/learning/articles/sklearn-pipeline/sklearn-pipeline.component';

// DevOps Articles
import { OQueEDevopsComponent } from './components/learning/articles/o-que-e-devops/o-que-e-devops.component';
import { CicdGithubActionsComponent } from './components/learning/articles/cicd-github-actions/cicd-github-actions.component';
import { IacComTerraformComponent } from './components/learning/articles/iac-com-terraform/iac-com-terraform.component';
import { OrquestracaoDockerSwarmComponent } from './components/learning/articles/orquestracao-docker-swarm/orquestracao-docker-swarm.component';
import { MonitoramentoObservabilidadeComponent } from './components/learning/articles/monitoramento-observabilidade/monitoramento-observabilidade.component';

// DevOps Avançado Articles
import { IntroKubernetesComponent } from './components/learning/articles/intro-kubernetes/intro-kubernetes.component';
import { PrincipaisConceitosK8sComponent } from './components/learning/articles/principais-conceitos-k8s/principais-conceitos-k8s.component';
import { OQueEGitopsComponent } from './components/learning/articles/o-que-e-gitops/o-que-e-gitops.component';
import { FerramentasGitopsComponent } from './components/learning/articles/ferramentas-gitops/ferramentas-gitops.component';
import { SegurancaContainersComponent } from './components/learning/articles/seguranca-containers/seguranca-containers.component';
import { SegurancaCiCdComponent } from './components/learning/articles/seguranca-ci-cd/seguranca-ci-cd.component';

// CSS Design Path Articles
import { HierarquiaVisualComponent } from './components/learning/articles/hierarquia-visual/hierarquia-visual.component';
import { CoresEContrasteComponent } from './components/learning/articles/cores-e-contraste/cores-e-contraste.component';
import { TipografiaFuncionalComponent } from './components/learning/articles/tipografia-funcional/tipografia-funcional.component';
import { LayoutsComGridFlexboxComponent } from './components/learning/articles/layouts-com-grid-flexbox/layouts-com-grid-flexbox.component';
import { ProfundidadeComSombrasComponent } from './components/learning/articles/profundidade-com-sombras/profundidade-com-sombras.component';
import { FundosImpactantesGradientesComponent } from './components/learning/articles/fundos-impactantes-gradientes/fundos-impactantes-gradientes.component';
import { AnimacoesETransicoesComponent } from './components/learning/articles/animacoes-e-transicoes/animacoes-e-transicoes.component';
import { FormasComClipPathComponent } from './components/learning/articles/formas-com-clip-path/formas-com-clip-path.component';
import { EfeitosComFiltrosComponent } from './components/learning/articles/efeitos-com-filtros/efeitos-com-filtros.component';

// CSS Path 3: UI/UX para Ferramentas de DevOps
import { DesignDeDashboardsComponent } from './components/learning/articles/design-de-dashboards/design-de-dashboards.component';
import { UxFerramentasInternasComponent } from './components/learning/articles/ux-ferramentas-internas/ux-ferramentas-internas.component';
import { StatusPagesEfetivasComponent } from './components/learning/articles/status-pages-efetivas/status-pages-efetivas.component';
import { FeedbackVisualAssincronoComponent } from './components/learning/articles/feedback-visual-assincrono/feedback-visual-assincrono.component';

export const APP_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '', component: HomeComponent },
  { path: 'blog', component: BlogListComponent },
  { path: 'blog/:slug', component: BlogPostComponent },
  { path: 'forum', component: ForumListComponent },
  { path: 'forum/new', component: ForumNewTopicComponent },
  { path: 'forum/:topicId', component: ForumTopicComponent },
  { path: 'templates', component: TemplateListComponent },
  { path: 'templates/:id', component: TemplateDetailComponent },
  { path: 'learning', component: LearningIndexComponent },
  { path: 'learning/:slug', component: LearningPathComponent },
  
  // Jornada do Desenvolvedor
  { path: 'learning/article/o-que-e-programacao', component: OQueEProgramacaoComponent },
  { path: 'learning/article/logica-de-programacao', component: LogicaDeProgramacaoComponent },
  { path: 'learning/article/tipos-de-dados', component: TiposDeDadosComponent },
  { path: 'learning/article/introducao-pseudocodigo', component: IntroducaoPseudocodigoComponent },
  { path: 'learning/article/como-internet-funciona', component: ComoInternetFuncionaComponent },
  { path: 'learning/article/http-apis', component: HttpApisComponent },
  { path: 'learning/article/entendendo-json', component: EntendendoJsonComponent },
  { path: 'learning/article/o-que-sao-webhooks', component: OQueSaoWebhooksComponent },
  { path: 'learning/article/ide-console', component: IdeConsoleComponent },
  { path: 'learning/article/git-github', component: GitGithubComponent },
  { path: 'learning/article/o-que-e-ide', component: OQueEIdeComponent },
  { path: 'learning/article/gerenciadores-pacotes-npm', component: GerenciadoresPacotesNpmComponent },
  { path: 'learning/article/introducao-docker', component: IntroducaoDockerComponent },
  { path: 'learning/article/volumes-docker', component: VolumesDockerComponent },
  { path: 'learning/article/redes-docker', component: RedesDockerComponent },
  { path: 'learning/article/regex-basico', component: RegexBasicoComponent },
  { path: 'learning/article/hello-world-nodejs', component: HelloWorldNodejsComponent },
  { path: 'learning/article/o-que-e-banco-de-dados', component: OQueEBancoDeDadosComponent },
  { path: 'learning/article/conectando-app-banco-dados', component: ConectandoAppBancoDadosComponent },
  { path: 'learning/article/construindo-primeira-api-rest', component: ConstruindoApiRestCrudComponent },
  { path: 'learning/article/o-que-e-jwt', component: OQueEJwtComponent },
  { path: 'learning/article/dockerizando-app-nodejs', component: DockerizandoAppNodejsComponent },
  { path: 'learning/article/o-que-e-vps', component: OQueEVpsComponent },
  { path: 'learning/article/publicando-app-vps', component: PublicandoAppVpsComponent },

  // Fundamentos n8n
  { path: 'learning/article/entendendo-expressoes-cron', component: EntendendoExpressoesCronComponent },
  { path: 'learning/article/o-que-e-n8n', component: OQueEN8nComponent },
  { path: 'learning/article/conhecendo-interface-n8n', component: ConhecendoInterfaceN8nComponent },
  { path: 'learning/article/o-que-e-no-n8n', component: OQueENoN8nComponent },
  { path: 'learning/article/primeiro-workflow-n8n', component: PrimeiroWorkflowN8nComponent },

  // n8n Básico
  { path: 'learning/article/n8n-data-flow', component: N8nDataFlowComponent },
  { path: 'learning/article/n8n-set-node', component: N8nSetNodeComponent },
  { path: 'learning/article/n8n-if-node', component: N8nIfNodeComponent },
  { path: 'learning/article/n8n-looping', component: N8nLoopingComponent },
  { path: 'learning/article/n8n-http-request', component: N8nHttpRequestComponent },
  { path: 'learning/article/n8n-credentials', component: N8nCredentialsComponent },

  // n8n Intermediário
  { path: 'learning/article/n8n-merge-node', component: N8nMergeNodeComponent },
  { path: 'learning/article/n8n-split-in-batches', component: N8nSplitInBatchesComponent },
  { path: 'learning/article/n8n-binary-data', component: N8nBinaryDataComponent },
  { path: 'learning/article/n8n-code-node', component: N8nCodeNodeComponent },
  { path: 'learning/article/n8n-subworkflows', component: N8nSubworkflowsComponent },
  { path: 'learning/article/n8n-error-handling', component: N8nErrorHandlingComponent },

  // n8n Avançado
  { path: 'learning/article/n8n-scaling-queue-mode', component: N8nScalingQueueModeComponent },
  { path: 'learning/article/n8n-subworkflows-vs-code', component: N8nSubworkflowsVsCodeComponent },
  { path: 'learning/article/n8n-static-data', component: N8nStaticDataComponent },
  { path: 'learning/article/n8n-git-versioning', component: N8nGitVersioningComponent },
  { path: 'learning/article/n8n-cicd', component: N8nCicdComponent },
  { path: 'learning/article/n8n-custom-nodes', component: N8nCustomNodesComponent },
  
  // Python para Automação de Dados
  { path: 'learning/article/python-intro-ambiente', component: PythonIntroAmbienteComponent },
  { path: 'learning/article/python-variaveis-tipos', component: PythonVariaveisTiposComponent },
  { path: 'learning/article/python-listas-dicionarios', component: PythonListasDicionariosComponent },
  { path: 'learning/article/python-funcoes', component: PythonFuncoesComponent },
  { path: 'learning/article/python-arquivos', component: PythonArquivosComponent },
  { path: 'learning/article/python-requests', component: PythonRequestsComponent },
  { path: 'learning/article/python-web-scraping', component: PythonWebScrapingComponent },
  { path: 'learning/article/pandas-intro', component: PandasIntroComponent },
  { path: 'learning/article/pandas-leitura-escrita', component: PandasLeituraEscritaComponent },
  { path: 'learning/article/pandas-selecao-filtragem', component: PandasSelecaoFiltragemComponent },
  { path: 'learning/article/pandas-limpeza-dados', component: PandasLimpezaDadosComponent },
  { path: 'learning/article/pandas-agrupamento', component: PandasAgrupamentoComponent },

  // Scikit-learn
  { path: 'learning/article/sklearn-o-que-e-ml', component: SklearnOQueEMlComponent },
  { path: 'learning/article/sklearn-primeiro-modelo', component: SklearnPrimeiroModeloComponent },
  { path: 'learning/article/sklearn-metricas', component: SklearnMetricasComponent },
  { path: 'learning/article/sklearn-feature-engineering', component: SklearnFeatureEngineeringComponent },
  { path: 'learning/article/sklearn-pipeline', component: SklearnPipelineComponent },

  // DevOps
  { path: 'learning/article/o-que-e-devops', component: OQueEDevopsComponent },
  { path: 'learning/article/cicd-github-actions', component: CicdGithubActionsComponent },
  { path: 'learning/article/iac-com-terraform', component: IacComTerraformComponent },
  { path: 'learning/article/orquestracao-docker-swarm', component: OrquestracaoDockerSwarmComponent },
  { path: 'learning/article/monitoramento-observabilidade', component: MonitoramentoObservabilidadeComponent },

  // DevOps Avançado
  { path: 'learning/article/intro-kubernetes', component: IntroKubernetesComponent },
  { path: 'learning/article/principais-conceitos-k8s', component: PrincipaisConceitosK8sComponent },
  { path: 'learning/article/o-que-e-gitops', component: OQueEGitopsComponent },
  { path: 'learning/article/ferramentas-gitops', component: FerramentasGitopsComponent },
  { path: 'learning/article/seguranca-containers', component: SegurancaContainersComponent },
  { path: 'learning/article/seguranca-ci-cd', component: SegurancaCiCdComponent },

  // CSS & Design
  { path: 'learning/article/hierarquia-visual', component: HierarquiaVisualComponent },
  { path: 'learning/article/cores-e-contraste', component: CoresEContrasteComponent },
  { path: 'learning/article/tipografia-funcional', component: TipografiaFuncionalComponent },
  { path: 'learning/article/layouts-com-grid-flexbox', component: LayoutsComGridFlexboxComponent },
  { path: 'learning/article/profundidade-com-sombras', component: ProfundidadeComSombrasComponent },
  { path: 'learning/article/fundos-impactantes-gradientes', component: FundosImpactantesGradientesComponent },
  { path: 'learning/article/animacoes-e-transicoes', component: AnimacoesETransicoesComponent },
  { path: 'learning/article/formas-com-clip-path', component: FormasComClipPathComponent },
  { path: 'learning/article/efeitos-com-filtros', component: EfeitosComFiltrosComponent },
  
  // CSS & UI/UX for DevOps
  { path: 'learning/article/design-de-dashboards', component: DesignDeDashboardsComponent },
  { path: 'learning/article/ux-ferramentas-internas', component: UxFerramentasInternasComponent },
  { path: 'learning/article/status-pages-efetivas', component: StatusPagesEfetivasComponent },
  { path: 'learning/article/feedback-visual-assincrono', component: FeedbackVisualAssincronoComponent },

  { path: 'tools', component: ToolsIndexComponent },
  { path: 'tools/gerador-box-shadow', component: BoxShadowGeneratorComponent },
  { path: 'tools/gerador-gradiente-css', component: CssGradientGeneratorComponent },
  { path: 'tools/gerador-clip-path', component: ClipPathGeneratorComponent },
  { path: 'tools/construtor-grid-css', component: CssGridBuilderComponent },
  { path: 'tools/gerador-filtros-css', component: CssFilterGeneratorComponent },
  { path: 'tools/gerador-animacao-css', component: CssAnimationGeneratorComponent },
  { path: 'tools/gerador-cron', component: CronGeneratorComponent },
  { path: 'tools/formatador-json', component: JsonFormatterComponent },
  { path: 'tools/url-codec', component: UrlCodecComponent },
  { path: 'tools/base64-codec', component: Base64CodecComponent },
  { path: 'tools/jwt-decoder', component: JwtDecoderComponent },
  { path: 'tools/timestamp-converter', component: TimestampConverterComponent },
  { path: 'tools/n8n-expression-simulator', component: N8nExpressionSimulatorComponent },
  { path: 'tools/data-converter', component: DataConverterComponent },
  { path: 'tools/gerador-hash', component: HashGeneratorComponent },
  { path: 'tools/gerador-senha', component: PasswordGeneratorComponent },
  { path: 'tools/gerador-uuid', component: UuidGeneratorComponent },
  { path: 'tools/testador-regex', component: RegexTesterComponent },
  { path: 'tools/gerador-dados-falsos', component: MockDataGeneratorComponent },
  { path: 'tools/webhook-tester', component: WebhookTesterComponent },
  { path: 'tools/meu-ip', component: MyIpComponent },
  { path: 'tools/cliente-rest', component: RestClientComponent },
  { path: 'tools/verificador-dns', component: DnsCheckerComponent },
  { path: 'tools/verificador-ssl', component: SslCheckerComponent },
  { path: 'tools/comparador-texto', component: DiffCheckerComponent },
  { path: 'tools/docker-compose-generator', component: DockerComposeGeneratorComponent },
  { path: 'tools/gerador-qr-code', component: QrCodeGeneratorComponent },
  { path: 'tools/gerenciador-n8n', component: N8nManagerComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
