import { useEffect, useMemo, useState } from 'react';
import { FileCheck, Plus, Search, Trash2, Pencil } from 'lucide-react';
import { apiService } from '../services/apiService';
import { ToastNotification } from '../components/ToastNotification';
import { SecurePDFViewer } from '../components/SecurePDFViewer';
import jsPDF from 'jspdf';

const DISCIPLINAS_TRANSVERSAIS = [
  'Português',
  'Matemática',
  'História',
  'Geografia',
  'Ciências',
  'Educação Física',
  'Ensino Religioso',
  'Computação',
  'Inglês',
  'Artes',
];

const EIXOS_BNCC = [
  'Pensamento Computacional',
  'Mundo Digital',
  'Cultura Digital',
];

interface HabilidadeCurriculo {
  id: number;
  codigo: string;
  eixo: string;
  descricao: string;
}

interface Activity {
  id: string;
  nome_atividade: string;
  descricao?: string;
  tipo: 'Plugada' | 'Desplugada';
  etapa: 'Educação Infantil' | 'Anos Iniciais' | 'Anos Finais';
  disciplinas_transversais?: string[];
  eixos_bncc?: string[];
  habilidades_ids?: number[];
  habilidades?: HabilidadeCurriculo[];
  duracao?: string;
  thumbnail_url?: string;
}

interface HabilidadeDisciplinaIntegrada {
  id: string;
  codigo: string;
  descricao: string;
}

interface ObjetivoEspecifico {
  id: string;
  texto: string;
}

export interface PlanoAulaBetaModel {
  id: number;
  atividadeId: string;
  atividadeTitulo: string;
  atividadeThumbnail?: string;

  cargaHorariaMin: number;
  tipoAtividade: 'Plugada' | 'Desplugada';

  componenteCurricularPrincipal: string;
  disciplinasIntegradas: string[];

  eixosTematicos: string[];
  habilidadesComputacaoIds: number[];

  habilidadesDisciplinasIntegradas: HabilidadeDisciplinaIntegrada[];

  objetivoGeral: string;
  objetivosEspecificos: ObjetivoEspecifico[];

  introducaoTempoMin: number;
  introducaoDescricao: string;

  desenvolvimentoTempoMin: number;
  desenvolvimentoSequenciaColetiva: string;
  desenvolvimentoMaoNaMassa: string;
  desenvolvimentoDesafioExtra: string;

  fechamentoTempoMin: number;

  recursosDidaticos: string;

  avaliacaoCriterios: string;
  avaliacaoInstrumento: string;

  adaptacoesInclusao: string;

  createdAt: string;
  updatedAt: string;
}

const generateTempId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const PlanoAulaBeta = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [curriculoHabilidades, setCurriculoHabilidades] = useState<HabilidadeCurriculo[]>([]);
  const [habilidadesSearch, setHabilidadesSearch] = useState('');

  const [plans, setPlans] = useState<PlanoAulaBetaModel[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loadingActivities, setLoadingActivities] = useState(false);

  const [formAtividadeId, setFormAtividadeId] = useState('');
  const [formCargaHoraria, setFormCargaHoraria] = useState<number | ''>('');
  const [formTipoAtividade, setFormTipoAtividade] = useState<'Plugada' | 'Desplugada'>('Plugada');
  const [formComponentePrincipal, setFormComponentePrincipal] = useState('');
  const [formDisciplinasIntegradas, setFormDisciplinasIntegradas] = useState<string[]>([]);
  const [formEixosTematicos, setFormEixosTematicos] = useState<string[]>([]);
  const [formHabilidadesComputacaoIds, setFormHabilidadesComputacaoIds] = useState<number[]>([]);
  const [formHabilidadesDisciplinasIntegradas, setFormHabilidadesDisciplinasIntegradas] = useState<HabilidadeDisciplinaIntegrada[]>([]);
  const [formObjetivoGeral, setFormObjetivoGeral] = useState('');
  const [formObjetivosEspecificos, setFormObjetivosEspecificos] = useState<ObjetivoEspecifico[]>([]);
  const [formIntroducaoTempo, setFormIntroducaoTempo] = useState<number | ''>('');
  const [formIntroducaoDescricao, setFormIntroducaoDescricao] = useState('');
  const [formDesenvolvimentoTempo, setFormDesenvolvimentoTempo] = useState<number | ''>('');
  const [formDesenvolvimentoSequenciaColetiva, setFormDesenvolvimentoSequenciaColetiva] = useState('');
  const [formDesenvolvimentoMaoNaMassa, setFormDesenvolvimentoMaoNaMassa] = useState('');
  const [formDesenvolvimentoDesafioExtra, setFormDesenvolvimentoDesafioExtra] = useState('');
  const [formFechamentoTempo, setFormFechamentoTempo] = useState<number | ''>('');
  const [formRecursosDidaticos, setFormRecursosDidaticos] = useState('');
  const [formAvaliacaoCriterios, setFormAvaliacaoCriterios] = useState('');
  const [formAvaliacaoInstrumento, setFormAvaliacaoInstrumento] = useState('');
  const [formAdaptacoesInclusao, setFormAdaptacoesInclusao] = useState('');

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewPdf, setPreviewPdf] = useState<{ url: string; title: string } | null>(null);

  // Carrega atividades e currículo BNCC uma vez
  useEffect(() => {
    const loadActivities = async () => {
      setLoadingActivities(true);
      try {
        const res = await apiService.getActivities({});
        if (!res.error && (res as any).activities) {
          setActivities((res as any).activities as Activity[]);
        } else {
          setActivities([]);
        }
      } catch {
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    const loadCurriculo = async () => {
      try {
        const res = await apiService.getCurriculoBnccHabilidades({});
        if (!res.error && res.habilidades?.length) {
          setCurriculoHabilidades(
            res.habilidades.map((h: any) => ({
              id: Number(h.id),
              codigo: h.codigo || '',
              eixo: h.eixo || '',
              descricao: h.descricao || '',
            }))
          );
        }
      } catch {
        // ignore
      }
    };

    loadActivities();
    loadCurriculo();
  }, []);

  // Carrega planos de aula beta somente depois de ter as atividades em memória,
  // para já conseguir montar título e thumbnail corretamente.
  useEffect(() => {
    if (activities.length === 0) return;

    const loadPlans = async () => {
      try {
        const res = await apiService.getLessonPlansBeta();
        if (!res.error && res.planos) {
          const mapped = (res.planos as any[]).map((plano) => {
            const atividade = activities.find((a) => a.id === plano.atividade_id);
            return {
              id: plano.id as number,
              atividadeId: plano.atividade_id as string,
              atividadeTitulo: atividade?.nome_atividade || (plano.atividade_id as string),
              atividadeThumbnail: atividade?.thumbnail_url,
              cargaHorariaMin: (plano.carga_horaria_min as number) ?? 0,
              tipoAtividade: (plano.tipo_atividade as 'Plugada' | 'Desplugada') ?? 'Plugada',
              componenteCurricularPrincipal:
                (plano.componente_curricular_principal as string) || '',
              disciplinasIntegradas:
                Array.isArray(plano.disciplinas_integradas) ? plano.disciplinas_integradas : [],
              eixosTematicos:
                Array.isArray(plano.eixos_tematicos) ? plano.eixos_tematicos : [],
              habilidadesComputacaoIds:
                Array.isArray(plano.habilidades_computacao_ids)
                  ? plano.habilidades_computacao_ids
                  : [],
              habilidadesDisciplinasIntegradas:
                Array.isArray(plano.habilidades_disciplinas_integradas)
                  ? plano.habilidades_disciplinas_integradas
                  : [],
              objetivoGeral: (plano.objetivo_geral as string) || '',
              objetivosEspecificos:
                Array.isArray(plano.objetivos_especificos) ? plano.objetivos_especificos : [],
              introducaoTempoMin: (plano.introducao_tempo_min as number) ?? 0,
              introducaoDescricao: (plano.introducao_descricao as string) || '',
              desenvolvimentoTempoMin: (plano.desenvolvimento_tempo_min as number) ?? 0,
              desenvolvimentoSequenciaColetiva:
                (plano.desenvolvimento_sequencia_coletiva as string) || '',
              desenvolvimentoMaoNaMassa:
                (plano.desenvolvimento_mao_na_massa as string) || '',
              desenvolvimentoDesafioExtra:
                (plano.desenvolvimento_desafio_extra as string) || '',
              fechamentoTempoMin: (plano.fechamento_tempo_min as number) ?? 0,
              recursosDidaticos: (plano.recursos_didaticos as string) || '',
              avaliacaoCriterios: (plano.avaliacao_criterios as string) || '',
              avaliacaoInstrumento: (plano.avaliacao_instrumento as string) || '',
              adaptacoesInclusao: (plano.adaptacoes_inclusao as string) || '',
              createdAt: (plano.created_at as string) || '',
              updatedAt: (plano.updated_at as string) || '',
            } as PlanoAulaBetaModel;
          });
          setPlans(mapped);
        } else {
          setPlans([]);
        }
      } catch {
        setPlans([]);
      }
    };

    loadPlans();
  }, [activities]);

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) =>
      (a.nome_atividade || '').localeCompare(b.nome_atividade || '', 'pt-BR', { sensitivity: 'base' })
    );
  }, [activities]);

  const selectedActivity = useMemo(
    () => activities.find((a) => a.id === formAtividadeId),
    [activities, formAtividadeId]
  );

  useEffect(() => {
    if (!selectedActivity) return;

    setFormTipoAtividade(selectedActivity.tipo);

    if (selectedActivity.disciplinas_transversais?.length) {
      setFormDisciplinasIntegradas(selectedActivity.disciplinas_transversais);
    }

    const eixosFromActivity = selectedActivity.eixos_bncc || [];
    const eixosFromHabilidades =
      (selectedActivity.habilidades_ids &&
        curriculoHabilidades
          .filter((h) => selectedActivity.habilidades_ids?.includes(h.id))
          .reduce<string[]>((acc, h) => (h.eixo && !acc.includes(h.eixo) ? [...acc, h.eixo] : acc), [])) ||
      [];
    const combinedEixos = Array.from(new Set([...eixosFromActivity, ...eixosFromHabilidades]));
    if (combinedEixos.length) {
      setFormEixosTematicos(combinedEixos);
    }

    const habilidadesIds =
      selectedActivity.habilidades_ids ??
      selectedActivity.habilidades?.map((h) => h.id) ??
      [];
    if (habilidadesIds.length) {
      setFormHabilidadesComputacaoIds(habilidadesIds);
    }
  }, [selectedActivity, curriculoHabilidades]);

  const filteredCurriculoHabilidades = useMemo(() => {
    const q = habilidadesSearch.trim().toLowerCase();
    if (!q) return curriculoHabilidades;
    return curriculoHabilidades.filter(
      (h) =>
        h.codigo?.toLowerCase().includes(q) ||
        h.eixo?.toLowerCase().includes(q) ||
        h.descricao?.toLowerCase().includes(q)
    );
  }, [curriculoHabilidades, habilidadesSearch]);

  const toggleDisciplinaIntegrada = (disciplina: string) => {
    setFormDisciplinasIntegradas((prev) =>
      prev.includes(disciplina) ? prev.filter((d) => d !== disciplina) : [...prev, disciplina]
    );
  };

  const toggleEixoTematico = (eixo: string) => {
    setFormEixosTematicos((prev) =>
      prev.includes(eixo) ? prev.filter((e) => e !== eixo) : [...prev, eixo]
    );
  };

  const toggleHabilidadeComputacao = (id: number) => {
    setFormHabilidadesComputacaoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addHabilidadeDisciplinaIntegrada = () => {
    setFormHabilidadesDisciplinasIntegradas((prev) => [
      ...prev,
      { id: generateTempId(), codigo: '', descricao: '' },
    ]);
  };

  const updateHabilidadeDisciplinaIntegrada = (
    id: string,
    field: 'codigo' | 'descricao',
    value: string
  ) => {
    setFormHabilidadesDisciplinasIntegradas((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const removeHabilidadeDisciplinaIntegrada = (id: string) => {
    setFormHabilidadesDisciplinasIntegradas((prev) => prev.filter((h) => h.id !== id));
  };

  const addObjetivoEspecifico = () => {
    setFormObjetivosEspecificos((prev) => [
      ...prev,
      { id: generateTempId(), texto: '' },
    ]);
  };

  const updateObjetivoEspecifico = (id: string, texto: string) => {
    setFormObjetivosEspecificos((prev) =>
      prev.map((o) => (o.id === id ? { ...o, texto } : o))
    );
  };

  const removeObjetivoEspecifico = (id: string) => {
    setFormObjetivosEspecificos((prev) => prev.filter((o) => o.id !== id));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormAtividadeId('');
    setFormCargaHoraria('');
    setFormTipoAtividade('Plugada');
    setFormComponentePrincipal('');
    setFormDisciplinasIntegradas([]);
    setFormEixosTematicos([]);
    setFormHabilidadesComputacaoIds([]);
    setFormHabilidadesDisciplinasIntegradas([]);
    setFormObjetivoGeral('');
    setFormObjetivosEspecificos([]);
    setFormIntroducaoTempo('');
    setFormIntroducaoDescricao('');
    setFormDesenvolvimentoTempo('');
    setFormDesenvolvimentoSequenciaColetiva('');
    setFormDesenvolvimentoMaoNaMassa('');
    setFormDesenvolvimentoDesafioExtra('');
    setFormFechamentoTempo('');
    setFormRecursosDidaticos('');
    setFormAvaliacaoCriterios('');
    setFormAvaliacaoInstrumento('');
    setFormAdaptacoesInclusao('');
  };

  const handleEditPlan = (plan: PlanoAulaBetaModel) => {
    setEditingId(plan.id);
    setFormAtividadeId((plan as any).atividade_id || (plan as any).atividadeId || '');
    setFormCargaHoraria((plan as any).carga_horaria_min ?? (plan as any).cargaHorariaMin ?? 0);
    setFormTipoAtividade(
      ((plan as any).tipo_atividade as 'Plugada' | 'Desplugada') ??
        (plan as any).tipoAtividade ??
        'Plugada'
    );
    setFormComponentePrincipal(
      (plan as any).componente_curricular_principal ??
        (plan as any).componenteCurricularPrincipal ??
        ''
    );
    setFormDisciplinasIntegradas(
      (plan as any).disciplinas_integradas ?? (plan as any).disciplinasIntegradas ?? []
    );
    setFormEixosTematicos(
      (plan as any).eixos_tematicos ?? (plan as any).eixosTematicos ?? []
    );
    setFormHabilidadesComputacaoIds(
      (plan as any).habilidades_computacao_ids ??
        (plan as any).habilidadesComputacaoIds ??
        []
    );
    setFormHabilidadesDisciplinasIntegradas(
      (plan as any).habilidades_disciplinas_integradas ??
        (plan as any).habilidadesDisciplinasIntegradas ??
        []
    );
    setFormObjetivoGeral(
      (plan as any).objetivo_geral ?? (plan as any).objetivoGeral ?? ''
    );
    setFormObjetivosEspecificos(
      (plan as any).objetivos_especificos ?? (plan as any).objetivosEspecificos ?? []
    );
    setFormIntroducaoTempo(
      (plan as any).introducao_tempo_min ?? (plan as any).introducaoTempoMin ?? 0
    );
    setFormIntroducaoDescricao(
      (plan as any).introducao_descricao ?? (plan as any).introducaoDescricao ?? ''
    );
    setFormDesenvolvimentoTempo(
      (plan as any).desenvolvimento_tempo_min ??
        (plan as any).desenvolvimentoTempoMin ??
        0
    );
    setFormDesenvolvimentoSequenciaColetiva(
      (plan as any).desenvolvimento_sequencia_coletiva ??
        (plan as any).desenvolvimentoSequenciaColetiva ??
        ''
    );
    setFormDesenvolvimentoMaoNaMassa(
      (plan as any).desenvolvimento_mao_na_massa ??
        (plan as any).desenvolvimentoMaoNaMassa ??
        ''
    );
    setFormDesenvolvimentoDesafioExtra(
      (plan as any).desenvolvimento_desafio_extra ??
        (plan as any).desenvolvimentoDesafioExtra ??
        ''
    );
    setFormFechamentoTempo(
      (plan as any).fechamento_tempo_min ?? (plan as any).fechamentoTempoMin ?? 0
    );
    setFormRecursosDidaticos(
      (plan as any).recursos_didaticos ?? (plan as any).recursosDidaticos ?? ''
    );
    setFormAvaliacaoCriterios(
      (plan as any).avaliacao_criterios ?? (plan as any).avaliacaoCriterios ?? ''
    );
    setFormAvaliacaoInstrumento(
      (plan as any).avaliacao_instrumento ??
        (plan as any).avaliacaoInstrumento ??
        ''
    );
    setFormAdaptacoesInclusao(
      (plan as any).adaptacoes_inclusao ?? (plan as any).adaptacoesInclusao ?? ''
    );
  };

  const handleDeletePlan = (plan: PlanoAulaBetaModel) => {
    if (!window.confirm('Tem certeza que deseja excluir este plano de aula beta?')) return;
    apiService
      .deleteLessonPlanBeta(plan.id)
      .then((res) => {
        if (res.error) {
          setToast({
            type: 'error',
            message: res.message || 'Erro ao excluir plano de aula beta.',
          });
          return;
        }
        setPlans((prev) => prev.filter((p) => p.id !== plan.id));
        if (editingId === plan.id) {
          resetForm();
        }
        setToast({
          type: 'success',
          message: 'Plano de aula beta excluído com sucesso.',
        });
      })
      .catch(() => {
        setToast({
          type: 'error',
          message: 'Erro ao excluir plano de aula beta.',
        });
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAtividadeId || !formCargaHoraria) {
      setToast({ type: 'error', message: 'Selecione uma atividade e informe a carga horária.' });
      return;
    }

    const activity = activities.find((a) => a.id === formAtividadeId);
    const payload: any = {
      atividade_id: formAtividadeId,
      carga_horaria_min: Number(formCargaHoraria),
      tipo_atividade: formTipoAtividade,
      componente_curricular_principal: formComponentePrincipal,
      disciplinas_integradas: formDisciplinasIntegradas,
      eixos_tematicos: formEixosTematicos,
      habilidades_computacao_ids: formHabilidadesComputacaoIds,
      habilidades_disciplinas_integradas: formHabilidadesDisciplinasIntegradas,
      objetivo_geral: formObjetivoGeral,
      objetivos_especificos: formObjetivosEspecificos,
      introducao_tempo_min: Number(formIntroducaoTempo || 0),
      introducao_descricao: formIntroducaoDescricao,
      desenvolvimento_tempo_min: Number(formDesenvolvimentoTempo || 0),
      desenvolvimento_sequencia_coletiva: formDesenvolvimentoSequenciaColetiva,
      desenvolvimento_mao_na_massa: formDesenvolvimentoMaoNaMassa,
      desenvolvimento_desafio_extra: formDesenvolvimentoDesafioExtra,
      fechamento_tempo_min: Number(formFechamentoTempo || 0),
      recursos_didaticos: formRecursosDidaticos,
      avaliacao_criterios: formAvaliacaoCriterios,
      avaliacao_instrumento: formAvaliacaoInstrumento,
      adaptacoes_inclusao: formAdaptacoesInclusao,
    };

    try {
      if (editingId) {
        const res = await apiService.updateLessonPlanBeta(editingId, payload);
        if (res.error || !res.plano) {
          setToast({
            type: 'error',
            message: res.message || 'Erro ao atualizar plano de aula beta.',
          });
        } else {
          const plano = res.plano as any;
          const mapped: PlanoAulaBetaModel = {
            id: plano.id,
            atividadeId: plano.atividade_id,
            atividadeTitulo: activity?.nome_atividade || plano.atividade_id,
            atividadeThumbnail: activity?.thumbnail_url,
            cargaHorariaMin: plano.carga_horaria_min,
            tipoAtividade: plano.tipo_atividade,
            componenteCurricularPrincipal: plano.componente_curricular_principal || '',
            disciplinasIntegradas: plano.disciplinas_integradas || [],
            eixosTematicos: plano.eixos_tematicos || [],
            habilidadesComputacaoIds: plano.habilidades_computacao_ids || [],
            habilidadesDisciplinasIntegradas: plano.habilidades_disciplinas_integradas || [],
            objetivoGeral: plano.objetivo_geral || '',
            objetivosEspecificos: plano.objetivos_especificos || [],
            introducaoTempoMin: plano.introducao_tempo_min || 0,
            introducaoDescricao: plano.introducao_descricao || '',
            desenvolvimentoTempoMin: plano.desenvolvimento_tempo_min || 0,
            desenvolvimentoSequenciaColetiva: plano.desenvolvimento_sequencia_coletiva || '',
            desenvolvimentoMaoNaMassa: plano.desenvolvimento_mao_na_massa || '',
            desenvolvimentoDesafioExtra: plano.desenvolvimento_desafio_extra || '',
            fechamentoTempoMin: plano.fechamento_tempo_min || 0,
            recursosDidaticos: plano.recursos_didaticos || '',
            avaliacaoCriterios: plano.avaliacao_criterios || '',
            avaliacaoInstrumento: plano.avaliacao_instrumento || '',
            adaptacoesInclusao: plano.adaptacoes_inclusao || '',
            createdAt: plano.created_at,
            updatedAt: plano.updated_at,
          };
          setPlans((prev) => prev.map((p) => (p.id === mapped.id ? mapped : p)));
          setToast({
            type: 'success',
            message: 'Plano de aula beta atualizado com sucesso.',
          });
          resetForm();
        }
      } else {
        const res = await apiService.createLessonPlanBeta(payload);
        if (res.error || !res.plano) {
          setToast({
            type: 'error',
            message: res.message || 'Erro ao criar plano de aula beta.',
          });
        } else {
          const plano = res.plano as any;
          const mapped: PlanoAulaBetaModel = {
            id: plano.id,
            atividadeId: plano.atividade_id,
            atividadeTitulo: activity?.nome_atividade || plano.atividade_id,
            atividadeThumbnail: activity?.thumbnail_url,
            cargaHorariaMin: plano.carga_horaria_min,
            tipoAtividade: plano.tipo_atividade,
            componenteCurricularPrincipal: plano.componente_curricular_principal || '',
            disciplinasIntegradas: plano.disciplinas_integradas || [],
            eixosTematicos: plano.eixos_tematicos || [],
            habilidadesComputacaoIds: plano.habilidades_computacao_ids || [],
            habilidadesDisciplinasIntegradas: plano.habilidades_disciplinas_integradas || [],
            objetivoGeral: plano.objetivo_geral || '',
            objetivosEspecificos: plano.objetivos_especificos || [],
            introducaoTempoMin: plano.introducao_tempo_min || 0,
            introducaoDescricao: plano.introducao_descricao || '',
            desenvolvimentoTempoMin: plano.desenvolvimento_tempo_min || 0,
            desenvolvimentoSequenciaColetiva: plano.desenvolvimento_sequencia_coletiva || '',
            desenvolvimentoMaoNaMassa: plano.desenvolvimento_mao_na_massa || '',
            desenvolvimentoDesafioExtra: plano.desenvolvimento_desafio_extra || '',
            fechamentoTempoMin: plano.fechamento_tempo_min || 0,
            recursosDidaticos: plano.recursos_didaticos || '',
            avaliacaoCriterios: plano.avaliacao_criterios || '',
            avaliacaoInstrumento: plano.avaliacao_instrumento || '',
            adaptacoesInclusao: plano.adaptacoes_inclusao || '',
            createdAt: plano.created_at,
            updatedAt: plano.updated_at,
          };
          setPlans((prev) => [mapped, ...prev]);
          setToast({
            type: 'success',
            message: 'Plano de aula beta criado com sucesso.',
          });
          resetForm();
        }
      }
    } catch {
      setToast({
        type: 'error',
        message: editingId
          ? 'Erro ao atualizar plano de aula beta.'
          : 'Erro ao criar plano de aula beta.',
      });
    }
  };

  const handleOpenPdf = (plan: PlanoAulaBetaModel) => {
    try {
      const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
      });

      const marginLeft = 15;
      const contentWidth = 180;
      const lineHeight = 5.2;
      let y = 28;

      const ensureSpace = (neededLines = 1) => {
        const needed = neededLines * lineHeight + 8;
        if (y + needed > 285) {
          doc.addPage();
          y = 20;
        }
      };

      // Cabeçalho no estilo do documento de funcionalidades
      // Faixa colorida com gradiente simples (aproximado)
      doc.setFillColor(4, 73, 130); // azul primário
      doc.rect(0, 0, 210, 18, 'F');
      doc.setDrawColor(4, 120, 87); // verde
      doc.setLineWidth(1);
      doc.line(10, 18, 200, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Plano de Aula – Plataforma BNCC', 105, 10, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const subtitulo = plan.atividadeTitulo || 'Plano de aula vinculado à plataforma BNCC';
      doc.text(subtitulo, 105, 15, { align: 'center' });

      // Volta para texto padrão
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const addSectionTitle = (title: string) => {
        ensureSpace(3);
        // Estilo semelhante aos títulos de seção do documento de funcionalidades:
        // texto azul em negrito com linha abaixo.
        doc.setFontSize(11.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(4, 73, 130);
        doc.text(title, marginLeft, y);
        // linha fina logo abaixo do título
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, y + 1.5, marginLeft + contentWidth, y + 1.5);

        y += lineHeight + 1.5;
        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
      };

      const addLabelValue = (label: string, value?: string | number | null) => {
        if (value === undefined || value === null || value === '') return;
        const text = `${label}: ${String(value)}`;
        const split = doc.splitTextToSize(text, contentWidth);
        ensureSpace(split.length);
        doc.text(split, marginLeft, y);
        y += lineHeight * split.length;
      };

      // Identificação
      addSectionTitle('IDENTIFICAÇÃO');
      addLabelValue('Atividade', plan.atividadeTitulo);
      addLabelValue('Carga Horária (minutos)', plan.cargaHorariaMin);
      addLabelValue('Tipo de Atividade', plan.tipoAtividade);
      ensureSpace(2);

      // Tema e Integração
      addSectionTitle('TEMA E INTEGRAÇÃO');
      addLabelValue('Componente Curricular Principal', plan.componenteCurricularPrincipal);
      if (plan.disciplinasIntegradas && plan.disciplinasIntegradas.length > 0) {
        addLabelValue('Disciplinas Integradas', plan.disciplinasIntegradas.join(', '));
      }
      ensureSpace(3);

      // Alinhamento Curricular
      addSectionTitle('ALINHAMENTO CURRICULAR (BNCC & CURRÍCULO MG)');
      if (plan.eixosTematicos && plan.eixosTematicos.length > 0) {
        addLabelValue('Eixos Temáticos (Computação)', plan.eixosTematicos.join(', '));
      }
      if (plan.habilidadesComputacaoIds && plan.habilidadesComputacaoIds.length > 0) {
        addLabelValue(
          'Habilidades de Computação – BNCC Complementar (IDs)',
          plan.habilidadesComputacaoIds.join(', ')
        );
      }
      if (plan.habilidadesDisciplinasIntegradas && plan.habilidadesDisciplinasIntegradas.length > 0) {
        ensureSpace(2);
        doc.setFont('helvetica', 'bold');
        doc.text('Habilidades das Disciplinas Integradas:', marginLeft, y);
        y += lineHeight;
        doc.setFont('helvetica', 'normal');
        plan.habilidadesDisciplinasIntegradas.forEach((h) => {
          const linha = h.codigo ? `${h.codigo} - ${h.descricao}` : h.descricao;
          if (!linha) return;
          const split = doc.splitTextToSize(linha, 180);
          if (y + split.length * lineHeight > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(split, marginLeft + 4, y);
          y += lineHeight * split.length;
        });
      }
      ensureSpace(3);

      // Objetivos
      addSectionTitle('OBJETIVOS DE APRENDIZAGEM');
      if (plan.objetivoGeral) {
        const split = doc.splitTextToSize(`Objetivo Geral: ${plan.objetivoGeral}`, contentWidth);
        ensureSpace(split.length);
        doc.text(split, marginLeft, y);
        y += lineHeight * split.length;
      }
      if (plan.objetivosEspecificos && plan.objetivosEspecificos.length > 0) {
        ensureSpace(2);
        doc.setFont('helvetica', 'bold');
        doc.text('Objetivos Específicos:', marginLeft, y);
        y += lineHeight;
        doc.setFont('helvetica', 'normal');
        plan.objetivosEspecificos.forEach((o, index) => {
          const texto = o.texto || '';
          if (!texto) return;
          const split = doc.splitTextToSize(`• ${texto}`, contentWidth - 4);
          ensureSpace(split.length);
          doc.text(split, marginLeft + 2, y);
          y += lineHeight * split.length;
        });
      }
      ensureSpace(3);

      // Desenvolvimento Metodológico
      addSectionTitle('DESENVOLVIMENTO METODOLÓGICO');

      // A. Introdução
      doc.setFont('helvetica', 'bold');
      doc.text('A. Introdução / Sensibilização', marginLeft, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      addLabelValue('Tempo (minutos)', plan.introducaoTempoMin);
      if (plan.introducaoDescricao) {
        const split = doc.splitTextToSize(plan.introducaoDescricao, contentWidth);
        ensureSpace(split.length);
        doc.text(split, marginLeft, y);
        y += lineHeight * split.length;
      }
      ensureSpace(3);

      // B. Desenvolvimento / Prática
      doc.setFont('helvetica', 'bold');
      doc.text('B. Desenvolvimento / Prática', marginLeft, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      addLabelValue('Tempo (minutos)', plan.desenvolvimentoTempoMin);
      if (plan.desenvolvimentoSequenciaColetiva) {
        const split = doc.splitTextToSize(
          `Etapa 1 – Sequência Coletiva: ${plan.desenvolvimentoSequenciaColetiva}`,
          contentWidth
        );
        ensureSpace(split.length);
        doc.text(split, marginLeft, y);
        y += lineHeight * split.length;
      }
      if (plan.desenvolvimentoMaoNaMassa) {
        const split = doc.splitTextToSize(
          `Etapa 2 – Mão na Massa: ${plan.desenvolvimentoMaoNaMassa}`,
          contentWidth
        );
        ensureSpace(split.length);
        doc.text(split, marginLeft, y);
        y += lineHeight * split.length;
      }
      if (plan.desenvolvimentoDesafioExtra) {
        const split = doc.splitTextToSize(
          `Etapa 3 – Desafio Extra: ${plan.desenvolvimentoDesafioExtra}`,
          contentWidth
        );
        ensureSpace(split.length);
        doc.text(split, marginLeft, y);
        y += lineHeight * split.length;
      }
      ensureSpace(3);

      // C. Fechamento
      doc.setFont('helvetica', 'bold');
      doc.text('C. Fechamento / Sistematização', marginLeft, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      addLabelValue('Tempo (minutos)', plan.fechamentoTempoMin);
      ensureSpace(2);

      // Recursos Didáticos
      addSectionTitle('RECURSOS DIDÁTICOS');
      if (plan.recursosDidaticos) {
        const split = doc.splitTextToSize(plan.recursosDidaticos, contentWidth);
        ensureSpace(split.length);
        doc.text(split, marginLeft, y);
        y += lineHeight * split.length;
      }
      ensureSpace(3);

      // Avaliação
      addSectionTitle('AVALIAÇÃO');
      if (plan.avaliacaoCriterios) {
        const split = doc.splitTextToSize(
          `Critérios de Avaliação: ${plan.avaliacaoCriterios}`,
          contentWidth
        );
        ensureSpace(split.length);
        doc.text(split, marginLeft, y);
        y += lineHeight * split.length;
      }
      if (plan.avaliacaoInstrumento) {
        const split = doc.splitTextToSize(
          `Instrumento: ${plan.avaliacaoInstrumento}`,
          contentWidth
        );
        ensureSpace(split.length);
        doc.text(split, marginLeft, y);
        y += lineHeight * split.length;
      }

      // Adaptações
      if (plan.adaptacoesInclusao) {
        ensureSpace(3);
        addSectionTitle('ADAPTAÇÕES (INCLUSÃO)');
        const split = doc.splitTextToSize(plan.adaptacoesInclusao, contentWidth);
        ensureSpace(split.length);
        doc.text(split, marginLeft, y);
      }

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPreviewPdf({
        url,
        title: `Plano de Aula - ${plan.atividadeTitulo}`,
      });
    } catch {
      setToast({
        type: 'error',
        message: 'Erro ao gerar PDF do plano de aula beta.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileCheck className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Plano de Aula Beta
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Versão beta de cadastro detalhado de planos de aula vinculados às atividades da plataforma.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Identificação – Atividade vinculada
                </label>
                <select
                  value={formAtividadeId}
                  onChange={(e) => setFormAtividadeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                >
                  <option value="">Selecione uma atividade...</option>
                  {sortedActivities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome_atividade}
                    </option>
                  ))}
                </select>
                {loadingActivities && (
                  <p className="text-xs text-gray-500 mt-1">Carregando atividades...</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Carga Horária (minutos)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formCargaHoraria}
                  onChange={(e) =>
                    setFormCargaHoraria(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                  placeholder="Ex.: 50"
                />
                <label className="block text-sm font-semibold text-gray-800 mt-2">
                  Tipo de Atividade
                </label>
                <select
                  value={formTipoAtividade}
                  onChange={(e) => setFormTipoAtividade(e.target.value as 'Plugada' | 'Desplugada')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                >
                  <option value="Plugada">Plugada</option>
                  <option value="Desplugada">Desplugada</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Tema e Integração</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Componente Curricular Principal
                  </label>
                  <input
                    type="text"
                    value={formComponentePrincipal}
                    onChange={(e) => setFormComponentePrincipal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as string]: '#005a93' }}
                    placeholder="Ex.: Matemática, Ciências, Língua Portuguesa..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disciplinas Integradas
                  </label>
                  <p className="text-xs text-gray-500 mb-1">
                    As disciplinas transversais da atividade vêm pré-selecionadas. Você pode ajustar se necessário.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {DISCIPLINAS_TRANSVERSAIS.map((disciplina) => (
                      <label key={disciplina} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={formDisciplinasIntegradas.includes(disciplina)}
                          onChange={() => toggleDisciplinaIntegrada(disciplina)}
                          className="h-4 w-4 rounded border-gray-300 text-[#005a93] focus:ring-[#005a93]"
                        />
                        <span>{disciplina}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Alinhamento Curricular (BNCC &amp; Currículo MG)
              </h2>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eixo Temático (Computação)
                </label>
                <p className="text-xs text-gray-500 mb-1">
                  Os eixos da atividade são preenchidos automaticamente a partir das habilidades, mas você pode ajustar.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {EIXOS_BNCC.map((eixo) => (
                    <label key={eixo} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={formEixosTematicos.includes(eixo)}
                        onChange={() => toggleEixoTematico(eixo)}
                        className="h-4 w-4 rounded border-gray-300 text-[#005a93] focus:ring-[#005a93]"
                      />
                      <span>{eixo}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Habilidades de Computação – BNCC Complementar
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Lista baseada no currículo BNCC de Computação. As habilidades já associadas à atividade aparecem selecionadas.
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={habilidadesSearch}
                    onChange={(e) => setHabilidadesSearch(e.target.value)}
                    placeholder="Buscar por código, eixo ou descrição..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as string]: '#005a93' }}
                  />
                </div>
                <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50 space-y-1">
                  {filteredCurriculoHabilidades.length === 0 ? (
                    <p className="text-xs text-gray-500 py-2">
                      {curriculoHabilidades.length === 0
                        ? 'Carregando habilidades ou currículo não configurado.'
                        : 'Nenhuma habilidade encontrada com este filtro.'}
                    </p>
                  ) : (
                    filteredCurriculoHabilidades.map((h) => (
                      <label
                        key={h.id}
                        className="flex items-start gap-2 cursor-pointer hover:bg-white rounded p-1.5"
                      >
                        <input
                          type="checkbox"
                          checked={formHabilidadesComputacaoIds.includes(h.id)}
                          onChange={() => toggleHabilidadeComputacao(h.id)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#005a93] focus:ring-[#005a93]"
                        />
                        <span className="text-xs text-gray-700 flex-1">
                          <strong>{h.codigo}</strong> · {h.eixo}
                          {h.descricao && (
                            <span className="block text-gray-500 truncate" title={h.descricao}>
                              {h.descricao}
                            </span>
                          )}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Habilidades das Disciplinas Integradas (BNCC Comum)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Informe manualmente o código e a descrição das habilidades da BNCC Comum relacionadas às disciplinas integradas.
                </p>
                <div className="space-y-3">
                  {formHabilidadesDisciplinasIntegradas.map((h) => (
                    <div
                      key={h.id}
                      className="grid grid-cols-1 md:grid-cols-[0.3fr,1fr,auto] gap-2 items-start"
                    >
                      <input
                        type="text"
                        value={h.codigo}
                        onChange={(e) =>
                          updateHabilidadeDisciplinaIntegrada(h.id, 'codigo', e.target.value)
                        }
                        placeholder="Código (ex.: EF15LP01)"
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                        style={{ ['--tw-ring-color' as string]: '#005a93' }}
                      />
                      <input
                        type="text"
                        value={h.descricao}
                        onChange={(e) =>
                          updateHabilidadeDisciplinaIntegrada(h.id, 'descricao', e.target.value)
                        }
                        placeholder="Descrição da habilidade"
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                        style={{ ['--tw-ring-color' as string]: '#005a93' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeHabilidadeDisciplinaIntegrada(h.id)}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addHabilidadeDisciplinaIntegrada}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar habilidade
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Objetivos de Aprendizagem</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objetivo Geral
                  </label>
                  <textarea
                    value={formObjetivoGeral}
                    onChange={(e) => setFormObjetivoGeral(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as string]: '#005a93' }}
                    placeholder="Descreva o objetivo geral da aula..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objetivos Específicos
                  </label>
                  <div className="space-y-2">
                    {formObjetivosEspecificos.map((o) => (
                      <div key={o.id} className="flex gap-2">
                        <textarea
                          value={o.texto}
                          onChange={(e) => updateObjetivoEspecifico(o.id, e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                          style={{ ['--tw-ring-color' as string]: '#005a93' }}
                          placeholder="Objetivo específico..."
                        />
                        <button
                          type="button"
                          onClick={() => removeObjetivoEspecifico(o.id)}
                          className="inline-flex items-center justify-center px-2 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-xs h-fit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addObjetivoEspecifico}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar objetivo específico
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Desenvolvimento Metodológico</h2>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  A. Introdução / Sensibilização
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-[0.3fr,1fr] gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tempo (minutos)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formIntroducaoTempo}
                      onChange={(e) =>
                        setFormIntroducaoTempo(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                      style={{ ['--tw-ring-color' as string]: '#005a93' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={formIntroducaoDescricao}
                      onChange={(e) => setFormIntroducaoDescricao(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                      style={{ ['--tw-ring-color' as string]: '#005a93' }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  B. Desenvolvimento / Prática
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-[0.3fr,1fr] gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tempo (minutos)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formDesenvolvimentoTempo}
                      onChange={(e) =>
                        setFormDesenvolvimentoTempo(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                      style={{ ['--tw-ring-color' as string]: '#005a93' }}
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Etapa 1 – Sequência Coletiva
                      </label>
                      <textarea
                        value={formDesenvolvimentoSequenciaColetiva}
                        onChange={(e) => setFormDesenvolvimentoSequenciaColetiva(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                        style={{ ['--tw-ring-color' as string]: '#005a93' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Etapa 2 – Mão na Massa
                      </label>
                      <textarea
                        value={formDesenvolvimentoMaoNaMassa}
                        onChange={(e) => setFormDesenvolvimentoMaoNaMassa(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                        style={{ ['--tw-ring-color' as string]: '#005a93' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Etapa 3 – Desafio Extra
                      </label>
                      <textarea
                        value={formDesenvolvimentoDesafioExtra}
                        onChange={(e) => setFormDesenvolvimentoDesafioExtra(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                        style={{ ['--tw-ring-color' as string]: '#005a93' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  C. Fechamento / Sistematização
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-[0.3fr,1fr] gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tempo (minutos)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formFechamentoTempo}
                      onChange={(e) =>
                        setFormFechamentoTempo(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                      style={{ ['--tw-ring-color' as string]: '#005a93' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Sistematização / Conclusão
                    </label>
                    <textarea
                      value={formAdaptacoesInclusao}
                      onChange={(e) => setFormAdaptacoesInclusao(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                      style={{ ['--tw-ring-color' as string]: '#005a93' }}
                      placeholder="Descreva como será feito o fechamento e a sistematização dos aprendizados..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Recursos Didáticos</h2>
              <textarea
                value={formRecursosDidaticos}
                onChange={(e) => setFormRecursosDidaticos(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                style={{ ['--tw-ring-color' as string]: '#005a93' }}
                placeholder="Liste os recursos (materiais, equipamentos, espaços) necessários para a aula..."
              />
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Avaliação</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Critérios de Avaliação
                  </label>
                  <textarea
                    value={formAvaliacaoCriterios}
                    onChange={(e) => setFormAvaliacaoCriterios(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as string]: '#005a93' }}
                    placeholder="Ex.: participação, colaboração, compreensão dos conceitos, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instrumento
                  </label>
                  <textarea
                    value={formAvaliacaoInstrumento}
                    onChange={(e) => setFormAvaliacaoInstrumento(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as string]: '#005a93' }}
                    placeholder="Ex.: observação, rubricas, produções dos alunos, autoavaliação..."
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Adaptações (Inclusão)</h2>
              <textarea
                value={formAdaptacoesInclusao}
                onChange={(e) => setFormAdaptacoesInclusao(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                style={{ ['--tw-ring-color' as string]: '#005a93' }}
                placeholder="Descreva as adaptações necessárias para garantir a participação de todos os estudantes..."
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 mt-4">
              <div className="text-xs text-gray-500">
                Campos mínimos: atividade vinculada e carga horária. Os demais campos podem ser preenchidos gradualmente.
              </div>
              <div className="flex items-center gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar edição
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium bg-[#005a93] text-white hover:bg-[#004676]"
                >
                  <FileCheck className="w-4 h-4" />
                  {editingId ? 'Salvar alterações' : 'Salvar plano de aula beta'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Planos de Aula Beta cadastrados</h2>
          </div>
          {plans.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum plano de aula beta cadastrado ainda. Use o formulário acima para criar o primeiro plano.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                >
                  {plan.atividadeThumbnail && (
                    <div className="h-32 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={plan.atividadeThumbnail}
                        alt={plan.atividadeTitulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-3 flex flex-col gap-2">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {plan.atividadeTitulo}
                      </h3>
                      <p className="text-xs text-gray-600">
                        Carga horária: {plan.cargaHorariaMin} min · {plan.tipoAtividade}
                      </p>
                      {plan.disciplinasIntegradas &&
                        plan.disciplinasIntegradas.length > 0 && (
                        <p className="text-[11px] text-gray-500 truncate">
                          Disciplinas: {plan.disciplinasIntegradas.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500">
                      <span>
                        Criado em{' '}
                        {new Date(plan.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPdf(plan)}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-blue-200 text-xs text-blue-700 hover:bg-blue-50"
                      >
                        <FileCheck className="w-3.5 h-3.5 mr-1" />
                        Ver PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditPlan(plan)}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(plan)}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-red-200 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {toast && (
          <ToastNotification
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {previewPdf && (
          <SecurePDFViewer
            pdfUrl={previewPdf.url}
            title={previewPdf.title}
            onClose={() => {
              URL.revokeObjectURL(previewPdf.url);
              setPreviewPdf(null);
            }}
            allowDownload
          />
        )}
      </div>
    </div>
  );
};

