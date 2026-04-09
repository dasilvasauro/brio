import { addDays } from 'date-fns';
import { useUserStore } from '../store/useUserStore';

export function useAppDate() {
  const isQA = useUserStore((state) => state.isQA);
  const qaDayOffset = useUserStore((state) => state.qaDayOffset);

  /**
   * Retorna a data e hora atual. 
   * Se o Modo QA estiver ativo, aplica o deslocamento de dias.
   * O objeto Date do JavaScript já sincroniza nativamente com o fuso horário local do usuário.
   */
  const getNow = () => {
    const realNow = new Date();
    
    if (isQA && qaDayOffset > 0) {
      return addDays(realNow, qaDayOffset);
    }
    
    return realNow;
  };

  /**
   * Verifica se estamos em um novo dia comparado à última vez que o app foi aberto.
   * @param {string|number|Date} lastAccessDate 
   */
  const isNewDay = (lastAccessDate) => {
    if (!lastAccessDate) return true;
    
    const now = getNow();
    const lastAccess = new Date(lastAccessDate);
    
    // Compara ano, mês e dia (ignora horas)
    return (
      now.getFullYear() > lastAccess.getFullYear() ||
      now.getMonth() > lastAccess.getMonth() ||
      now.getDate() > lastAccess.getDate()
    );
  };

  return { getNow, isNewDay };
}