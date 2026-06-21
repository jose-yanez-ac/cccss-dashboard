/**
 * Tipos del payload de la función `dashboard_public` (jsonb). La función expone
 * solo agregados + lista de CCSS sin `observaciones` + empresas para filtros.
 * Las tablas siguen cerradas a `anon`; lo único público es esta función.
 */

export type DashboardPublicKpis = {
  total_contratado_uf: number;
  facturado_uf: number;
  saldo_uf: number;
  proyeccion_total_uf: number;
  pct_facturado: number;
  total_ccss: number;
};

export type DashboardPublicEmpresaAgg = {
  empresa: string;
  n_ccss: number;
  contratado_uf: number;
  proyeccion_uf: number;
};

export type DashboardPublicEstadoAgg = {
  estado: string;
  n_ccss: number;
  contratado_uf: number;
  proyeccion_uf: number;
};

export type DashboardPublicCcss = {
  empresa: string;
  nombre: string;
  fase: string | null;
  tipo_financiamiento: string | null;
  sector: string | null;
  contratado_uf: number;
  facturado_uf: number;
  saldo_uf: number;
  estado: string;
};

export type DashboardPublic = {
  proyecto: { id: string; nombre: string; ds153_uf: number } | null;
  kpis: DashboardPublicKpis;
  por_empresa: DashboardPublicEmpresaAgg[];
  por_estado: DashboardPublicEstadoAgg[];
  ccss: DashboardPublicCcss[];
  empresas: { id: string; nombre: string }[];
};

export type DashboardPublicFiltros = {
  empresaId?: string;
  fase?: string;
  estado?: string;
  sector?: string;
};
