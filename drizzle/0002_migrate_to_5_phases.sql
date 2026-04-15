-- Migración: Actualizar tabla ates de 6 fases a 5 fases con estructura correcta
-- Cambiar 'competencia' a 'componente'
ALTER TABLE `ates` CHANGE COLUMN `competencia` `componente` varchar(255);

-- Eliminar columnas de fases antiguas (6 fases)
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase1Problema`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase1Contexto`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase1PreguntaOrientadora`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase1Importancia`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase2Investigacion`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase2Ideas`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase2MejorIdea`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase2Justificacion`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase3DescripcionSolucion`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase3CriteriosDiseño`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase3Materiales`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase3Herramientas`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase3Esquema`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase4Planificacion`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase4Pasos`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase4Cronograma`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase4Responsables`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase4Desafios`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase4Avances`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase5Funcionamiento`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase5ErroresEncontrados`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase5Mejoras`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase5Resultados`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase5CriteriosEvaluacion`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase6DescripcionFinal`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase6AudienciaDestino`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase6FormatoPresentacion`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase6MensajePrincipal`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase6Aprendizajes`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase6Impacto`;
ALTER TABLE `ates` DROP COLUMN IF EXISTS `fase6Completed`;

-- Agregar columnas para las 5 fases nuevas
-- FASE 1: CONTEXTUALIZACIÓN
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `situacionProblema` text;
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `analisisEntorno` text;
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `vinculacionIntereses` text;

-- FASE 2: FUNDAMENTACIÓN
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `objetivosAprendizaje` text;
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `contenidosDisciplinares` text;
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `articulacionCurriculo` text;

-- FASE 3: DISEÑO DIDÁCTICO
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `secuenciacion` text;
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `estrategias` text;
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `rolesYTiempos` text;

-- FASE 4: IMPLEMENTACIÓN
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `ejecucion` text;
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `mediacionDocente` text;
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `acompanamiento` text;

-- FASE 5: EVALUACIÓN
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `tipoEvaluacion` text;
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `criteriosEvaluacion` text;
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `instrumentosEvaluacion` text;
ALTER TABLE `ates` ADD COLUMN IF NOT EXISTS `reflexionRetroalimentacion` text;
